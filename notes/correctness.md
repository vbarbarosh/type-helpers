# Correctness & edge cases

*Current snapshot as of 2026-08-07; see [overview.md](overview.md). The suite
has 1,337 passing tests and 0 pending, with 100% reported coverage.*

The library's rule ([shape.md](shape.md)) is: data normally does not error;
schema-author mistakes do. The two former open items below are decided and
documented.

## 1. `obj` treats array input as a props source

Because `safe_obj` accepts arrays (see [api-consistency.md](api-consistency.md)
§2), `make(['a','b'], {0: 'str', length: 'int'})` produces
`{"0":"a","length":2}`. This can be useful for index-keyed specs, but
reading `length` as an object prop is surprising.

Decision: preserved and pinned. Arrays remain valid props sources (index and
`length` reads are regression-tested), README documents it, and Map/Set
entries are not own props, so collection data yields defaults — also pinned.

## 2. `union` without `default` is data-dependent

`make({kind:'x'}, {type:'union', prop:'kind', options:{a:{...}}})` throws
`Union type option not found`. A union with no valid `default` is therefore
total only for inputs whose discriminator matches an option.

The behavior is already pinned, [shape.md](shape.md) states the exception,
and README carries the same caveat in its union section.

## Sharp but intentional

- `nullable` does not catch `NaN` —
  `make(NaN, {type:'int', nullable:true})` returns `0`, not `null`.
- Nullable raw `null`/`undefined` short-circuits hooks. For non-nullish raw
  input, `before` may produce a nullish value and short-circuit conversion and
  `after`.
- `Infinity` becomes `bool: true`, `float: Number.MAX_VALUE`,
  `int: Number.MAX_SAFE_INTEGER`, and `str: ''`.
- Degenerate ranges are schema errors: `min > max` on `int`/`float` throws
  `[type=int] min should not exceed max`. The standalone `safe_int`/`safe_float`
  keep resolving silently (`min` wins) — they are total by design.
- An enum `default` is returned as-is even when it is not in `options`.
- Hex, exponent, and whitespace numeric strings coerce; partially numeric
  strings such as `'12px'` are rejected.
- `str` never stringifies objects or arrays, preventing accidental
  `[object Object]` leakage.
