# Overview & architecture

*Analysis of `@vbarbarosh/type-helpers` v0.2.0, written 2026-07-04 and
refreshed 2026-07-10.
Companion notes: [api-consistency.md](api-consistency.md),
[correctness.md](correctness.md), [tests.md](tests.md),
[docs-packaging.md](docs-packaging.md).*

## What it is

A zero-runtime-dependency CommonJS library (~660 lines of implementation,
~1,700 lines of tests) for turning untrusted input into well-typed values.
Three layers, each usable on its own:

1. **`edge_values.js`** — a curated list of ~50 tricky JS values (`-0`, `NaN`,
   `10n**100n`, `'0x1F'`, `new Boolean(false)`, `Object.create(null)`, …)
   designed for broad test sweeps. Most standalone helpers use it; `make` and
   `is_fn_ctor` use targeted tests. It is both a fixture and a shipped,
   documented export.
2. **Predicates and coercers** — 13 `is_*` predicates (strict, boolean-only)
   and 5 `safe_*` coercers (`safe_bool/int/float/str/obj`), each a single-file
   module with a colocated `*.test.js`.
3. **`make(input, expr, types)`** — a small recursive interpreter over a
   spec DSL (`src/make.js`), built on the `safe_*` layer. 14 built-in types
   (`raw any null const bool int float str enum array tuple tags obj union`)
   plus an extensible registry (`types`) supporting aliases with
   topmost-wins parameter override, plain-object shorthands, and function
   types as a Turing-complete escape hatch.

## Design philosophy

[shape.md](shape.md) (written by the author, 2026-06-11) states it precisely:
`make` is a **total normalizer**, not a validator. Every input maps to a
valid output; errors are generally for schema authors. A union without a valid
default is the input-dependent exception. Outputs are fixed points:
`make(make(x, e), e) === make(x, e)`.
This puts it in a different category from zod/yup/io-ts. One sharpening of
that claim is in [correctness.md](correctness.md) §2 (union without
`default` throws on data).

A notable structural detail: the spec language is self-hosting — the
`array` type normalizes its own params by calling
`make(params, {of: {type: 'any', default: 'raw'}, min: {type: 'int', min: 0}})`
(`src/make.js:77`).

## Entry points

- `main: src/make.js` — `require('@vbarbarosh/type-helpers')` returns the
  `make` function itself.
- Everything else is consumed via deep requires
  (`require('@vbarbarosh/type-helpers/src/safe_int')`), matching the README.
  No barrel file, no ESM `exports` map, no TypeScript definitions
  (see [docs-packaging.md](docs-packaging.md)).

## Module inventory

| Module | Role |
|---|---|
| `make.js` | spec interpreter; the package main |
| `edge_values.js` | shipped test-fixture list of hostile values |
| `is_array/bool/str/sym/obj/num/num_gt/empty` | strict predicates |
| `is_fn`, `is_fn_async`, `is_fn_gen`, `is_fn_gen_async`, `is_fn_ctor` | function-kind predicates |
| `safe_bool/int/float/str/obj` | total coercers with `empty_value` fallback |

## Health snapshot

- Tests: 1,199 passing, 3 pending; **100% statement/branch/function/line
  coverage** on every file (nyc).
- CI: GitHub Actions matrix on Node 18/20/22/24; `engines: node >= 18`.
- Release: `bin/release major|minor|patch` — tests, version bump, tag, push,
  `npm publish`; guarded by clean-worktree check.
- Repo hygiene: `dist/` exists but is empty (leftover, not shipped, invisible
  to git). The scratchpad now contains only live ideas and current-signature
  examples.
