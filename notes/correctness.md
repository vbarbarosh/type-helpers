# Correctness & edge cases

*Part of the 2026-07-04 analysis; see [overview.md](overview.md). Every
finding below was executed against the current code, not just read. All
1,186 existing tests pass; none of these contradicts a pinned test — they
live in the untested space around them.*

The library's own rule (docs/shape.md) is: data never errors, only schema
authors do. Findings 1–5 are places where that promise frays; the rest are
sharp-but-intentional edges.

## 1. Truthy non-object exprs crash with a raw TypeError

`make(x, true)` and `make(x, 5)` throw
`TypeError: Cannot use 'in' operator to search for 'type' in true` from the
`'type' in expr` check (`src/make.js:176`) instead of the friendly
"Empty expressions are not allowed" / "Invalid type" errors. The practical
trigger is the sugar form: any boolean or number **prop value** in a
plain-object spec crashes — `make({}, {foo: 'str', flag: true})` throws
(verified). A guard like `is_obj(expr)` before the `in` checks would route
these to a readable error.

## 2. The `type: [...]` escape hatch leaks reserved keys into props

`{type: ['str'], nullable: true, w: 'int'}` converts the whole expr to
props via `{...expr, type: expr.type[0]}` (`src/make.js:181`) — `nullable`
comes along as a prop named `nullable` with spec `true`, which crashes per
finding 1 (verified). With `null` input the outer `nullable` check fires
first and returns `null`, so the same spec behaves differently depending on
input — `nullable`/`before`/`after` should be stripped when reinterpreting
the expr as props.

## 3. `obj` treats array input as a props source

Because `safe_obj` accepts arrays (see [api-consistency.md](api-consistency.md) §2),
`make(['a','b'], {0: 'str', length: 'int'})` → `{"0":"a","length":2}`
(verified). Arguably fine for index-keyed props, but `length` being readable
as a prop is surprising; an `is_obj`-style array rejection in the `obj` type
would make array input yield all-defaults like other non-object input.

## 4. `obj` `transform` returning null crashes

`transform`'s return value is used directly as the props source
(`src/make.js:128`): `make({}, {type:'obj', transform: () => null, props: {a:'str'}})`
→ `TypeError: Cannot read properties of null` (verified). Wrapping the
transform result in `safe_obj(...)` would keep totality
(`transform ? safe_obj(params.transform(input)) : safe_obj(input)`).

## 5. Alias cycles are unguarded

`make(1, 'a', {a: {type: 'a'}})` → `RangeError: Maximum call stack size
exceeded` (verified; the alias-merge path `src/make.js:210` recurses with
the same name). Same family as the known non-well-founded recursion
(`of: 'node', min: 1` on null input) documented in `docs/shape.md`. A
seen-set of alias names during a single resolution chain would turn this
into a readable schema error.

## 6. `union` without `default` is the one data-dependent throw

`make({kind:'x'}, {type:'union', prop:'kind', options:{a:{...}}})` throws
`Union type option not found` (`src/make.js:148-149`, pinned by a test).
shape.md files this under "bad schema", but the trigger is the *input*
value — a union with no `default` is only total for inputs whose
discriminator matches. Worth a one-line caveat in README/shape.md:
"a union without `default` rejects unmatched data, the only place data can
throw."

## Sharp but intentional (documented and/or pinned)

- `nullable` does not catch `NaN` — `make(NaN, {type:'int', nullable:true})`
  → `0`, not `null` (README ⚠️, pinned).
- `Infinity` → `bool: true`, `float: Number.MAX_VALUE`,
  `int: MAX_SAFE_INTEGER`, `str: ''` — flagged as gotchas in the tests
  themselves (`src/make.test.js:203-214`).
- Degenerate ranges resolve silently: with `min > max`,
  `Math.max(min, Math.min(max, v))` returns `min` for any input; no schema
  sanity check.
- `enum` `default` is not validated against `options`
  (see [api-consistency.md](api-consistency.md) §5).
- Hex/exponent/whitespace numeric strings coerce (`'0x1F'` → 31); rejection
  of `'12px'` is via `*1` semantics, not `parseInt` — pinned across
  `safe_int`/`safe_float` tests.
- `str` never stringifies objects/arrays (`make({}, 'str')` → `''`) —
  a deliberate "objects never leak into strings" stance, pinned.
