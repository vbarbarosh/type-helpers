# The shape of the library

*An analysis of what `make(input, expr, types)` is, how expressive it is, and
what it can and cannot express. Written 2026-06-11.*

## What it is

`make` is a **total normalizer**, and that single design choice determines
everything else. Every input maps to a valid output; there is no error channel
for data. Errors exist only for the programmer (bad schema: unknown type, empty
enum, unresolvable union). This puts it in a fundamentally different category
from zod/yup/io-ts, which are *parsers* — they answer "is this valid?" and
reject. `make` answers "what's the closest valid value to this?" and always has
an answer. The closest relatives in spirit are proto3 default semantics and
canonicalization passes, not validators.

Two structural properties follow from this (both verified, see below):

1. **Outputs are fixed points** — `make(make(x, e), e) === make(x, e)`. The
   output domain is a canonical subset of JSON-ish values, and the function is
   safe to apply at every trust boundary without compounding damage.
2. Since `before`/`after` are the only places that can break idempotence, the
   declarative core is a genuine canonicalizer.

Mechanically it's a small recursive interpreter over an expression DSL with an
extensible environment (the `types` registry). A telling detail: `array`
normalizes *its own params* by calling `make(params, {of: ..., min: 0})` — the
spec language is self-hosting. Specs are just data, normalized by the same
machinery.

## What the declarative core can express

In type-algebra terms, it covers **regular tree types** — algebraic data types
without parametric polymorphism:

- **Products**: `obj` (records with per-field defaults, unknown keys dropped,
  `optional` fields), `tuple`.
- **Sums**: `union`, but only *tagged* sums — a discriminator property is
  mandatory.
- **Collections**: homogeneous `array` with min-length padding; `tags` as a
  canonical-subset type (dedup, order-preserving — effectively a set bounded by
  an enum).
- **Finite sets**: `enum`, with `transform` doubling as a rename-migration
  mechanism.
- **Scalars with refinement-by-clamping**: `int`/`float` ranges don't reject
  out-of-range values, they pull them into range. This is refinement in the
  coercion idiom.
- **Recursion**: registry names can reference themselves —
  `node: {label: 'str', children: {type: 'array', of: 'node'}}` works, depth
  bounded by the input. Caveat: recursion must be well-founded through
  defaults. `of: 'node', min: 1` diverges on `null` input (RangeError), because
  the default of the type mentions the type itself.
- **Bounded reuse**: aliases with topmost-wins override
  (`int_0_10: {type: 'int_0_100', max: 10}`) — single inheritance of
  parameters, flat, no diamond problems.
- **Nullability** as an orthogonal flag, and function types as a
  Turing-complete escape hatch — so strictly speaking it can express
  *anything*; the interesting question is what falls out of the declarative
  fragment versus what forces you into a function.

## What it cannot express

### By design — adding these would change its identity

- **Rejection.** There is no way to say "this input is unacceptable." No
  required fields: absence is silently papered over with a default, and the
  caller can never distinguish "was present and valid" from "was missing and
  synthesized." No error paths, no diagnostics, no partial-failure reporting.
  If you need to tell a user *what was wrong with their form*, this library is
  constitutionally unable to help — and bolting it on would make it a different
  library.
- **Provenance.** Related: the output carries no trace of how much repair
  happened. A fully-valid document and total garbage produce equally confident
  outputs.

### By gap — coercion-compatible, just absent

- **Dictionaries with dynamic keys** — a `{type: 'record', of: 'int'}`
  (arbitrary keys, uniform values). `props` is always a closed key set. This is
  the biggest practical hole; zod's `record` has no counterpart here.
- **Untagged unions** — "string or number" needs a function type (the
  `str_num` test does exactly this). No first-match-wins over arbitrary shapes.
- **String refinements** — no pattern, length, or format with fallback
  semantics (`make_color` in notes/scratchpad.md is a function type precisely because of
  this). A declarative
  `{type: 'str', match: /^#[0-9a-f]{6}$/, default: '#000000'}` would fit the
  coercion philosophy fine.
- **Collection constraints** — `array` has `min` but no `max`, no uniqueness
  outside `tags`.
- **Non-JSON leaves** — no date/timestamp canonical form; Maps, Sets, binary
  are inputs to be rejected, never outputs.
- **Unknown-key passthrough** — `obj` always drops; there's no "preserve what I
  didn't describe" mode short of `raw`.
- **User-defined generics** — `of`/`items` are built-in parameterization only;
  a registry entry can't take a type argument declaratively (function types can
  read `params`, so it's hand-rollable).
- **Cross-field constraints as constraints** — `after` can *enforce* an
  invariant by mutation (border `style: 'none'` → `size: 0`), but there's no
  declarative language for "min ≤ max" or "weights sum to 100"; each invariant
  is imperative.

## Summary

The shape is: **JSON Schema's structural fragment, minus all validation, plus
total-coercion semantics, plus an escape hatch to arbitrary functions.** Its
expressiveness ceiling as a declarative language is regular tree types with
clamped scalars — and within its design center (UI state, persisted documents,
query params: places where you must render *something* rather than show an
error) that ceiling is exactly right. The sharpest boundary isn't a missing
type, it's the missing verdict: the moment a use case needs to know whether the
input was *acceptable* rather than what it *normalizes to*, you've left this
library's universe.

## Appendix: verification

The structural claims above were checked against the implementation:

```js
const make = require('../src/make');

// 1. The registry expresses recursive types
const types = {node: {label: 'str', children: {type: 'array', of: 'node'}}};
make({label: 'a', children: [{label: 'b'}, 'junk']}, 'node', types);
// -> {label: 'a', children: [{label: 'b', children: []}, {label: '', children: []}]}

// 2. Non-well-founded recursion diverges (RangeError: stack size exceeded)
const bad = {node: {label: 'str', children: {type: 'array', of: 'node', min: 1}}};
make(null, 'node', bad); // 💥

// 3. Outputs are fixed points (idempotence)
const widget = {type: 'union', prop: 'kind', default: 'text', options: {text: {value: 'str'}, num: {value: 'float', min: 'float'}}};
const once = make({kind: 'num', value: '5'}, widget);
const twice = make(once, widget);
// JSON.stringify(once) === JSON.stringify(twice)
```
