# Docs & packaging

*Part of the 2026-07-04 analysis; see [overview.md](overview.md).*

## README.md

Thorough and, on spot-checking snippets against actual behavior, accurate —
including the honest ⚠️ notes (`nullable` doesn't catch `NaN`;
`empty_value` returned without conversion). Two nits:

- "Every function in this library is tested this way" (edge-values section)
  — true except `is_fn_ctor` (see [tests.md](tests.md)).
- The built-in `obj` section doesn't mention `transform` (used in
  `make.test.js` real-world scenarios and listed in the `src/make.js:124`
  comment), and `union`'s ability to reference a registry type name as an
  option value (`options: {error: 'error'}`) is only visible in tests.
  Given [scratchpad.md](scratchpad.md) floats "remove obj.transform",
  deciding its fate should precede documenting it.

## docs/shape.md

A high-quality design essay (total-normalizer framing, expressiveness
ceiling, verified claims appendix). One sharpening: it claims "no error
channel for data", but a `union` without `default` throws on unmatched
*input* (see [correctness.md](correctness.md) §6). The appendix's other
claims (recursive registry types, non-well-founded recursion diverging,
idempotence) reproduce as written.

## scratchpad.md (formerly root NOTES.md)

A scratchpad with stale entries that now contradict reality — worth a
cleanup pass so it doesn't mislead:

- "`make({type: 'bool', default: 555}) -> 555` ⚠️" — no longer true;
  returns `true` (verified). The `+` items (signature order, default
  clamping) appear resolved.
- "remove enum.transform / remove obj.transform" — meanwhile README
  documents `enum.transform` as a headline feature (rename migrations).
  Either the note or the doc should yield.
- The "human-readable error when no type was found" wish is implemented
  (`Invalid type: strx`, tested).

## package.json / publishing

- `main: src/make.js` — the package export **is** the `make` function;
  all helpers are deep-required (`@vbarbarosh/type-helpers/src/safe_int`).
  Consistent with README. No `exports` map: deep requires stay possible
  (good), but there's no ESM entry and **no TypeScript definitions** — for
  a typing-adjacent library, a hand-written `index.d.ts` (or at least
  JSDoc typedefs for `make`'s expr shapes) would be the single
  highest-leverage packaging improvement.
- `files: ["README.md", "src", "!src/*.test.js"]` — clean tarball
  (LICENSE is auto-included by npm). `img/` is not shipped; the README
  cover resolves on npmjs.com only via the `repository` field's relative-URL
  rewriting, which is set correctly, so this works.
- `engines: node >= 18` matches the CI matrix (18/20/22/24) and the
  syntax actually used (`??`, `Object.fromEntries`).
- Zero runtime deps; `@vbarbarosh/node-helpers` is a devDependency used
  only by `demos/table-columns.js`.

## bin/, demos/, stray dirs

- `bin/release` — strict-mode bash; refuses on dirty worktree, runs tests
  before `npm version`, tags, pushes, publishes. Solid. `bin/test` is a
  thin `npm test` wrapper.
- `demos/table-columns.js:16` calls `format_date_human(...)` inside a
  `read:` lambda — the function is nowhere defined. The demo runs today
  (the lambda is stored, never invoked), but any consumer who calls that
  column's `read()` gets a `ReferenceError`. Define a stub or drop the line.
- `dist/` is an empty directory — leftover, invisible to git, safe to
  `rmdir`.
