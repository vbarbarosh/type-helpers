# Test coverage & quality

*Part of the 2026-07-04 analysis; refreshed 2026-07-10 and 2026-09-02.*

## Snapshot

- `npm test` (`node:test` with builtin coverage): **2,100 passing, 0
  skipped**.
- **100% line/branch/function coverage on every implementation file** —
  `edge_values.js` is fixture data (its function values are never meant to
  run) and is excluded via `--test-coverage-exclude`; its own test asserts
  list integrity (unique labels, `value` present). The only
  coverage-ignored code is the three one-line `x()` probes in
  `is_fn_async`/`is_fn_gen`/`is_fn_gen_async`.
- Tests are colocated (`src/foo.test.js` next to `src/foo.js`) and excluded
  from the npm tarball via `files: ["!src/*.test.js"]`.

## The edge-values sweep pattern

The house style is the strongest part of the suite: most standalone helpers
have a `describe('should handle edge values')` that iterates all 78
`edge_values` and `switch`es on labels, with the `default` branch taking a
position on every value — so **adding a new edge value to the shared list
automatically confronts every participating helper with it**. Plus a uniform
`it('should accept no args')` case per function. `make.test.js` sweeps the
same list across its scalar types in a `bool`/`int`/`float`/`str` matrix
(exact expected values), and across `array`/`tuple`/`tags`/`obj`/`union`
asserting only the library-wide contract: no throw on data, and the output
is a fixed point. The composite sweep is what would have caught the
sparse-array hole leak fixed in the 2026-09-02 audit.

Deviations from the house style:

- `is_fn_ctor` has no edge-values sweep (hand-picked cases only). README
  states this exception explicitly.

## What make.test.js pins

- `obj`: transform totality and type check, nullish prop expressions,
  array-as-props, prop dropping, own-property-only reads.
- `union`: own-property discriminator read, required `options`, matched key
  as output, `__proto__` safety.
- Expression syntax: shorthand modifiers (`nullable`/`before`/`after`/
  `optional` in a props-shorthand object), escape hatch stripping, string
  registry entries, invalid registry entries, unprintable type names.
- **Policy coverage**: array-as-props in `obj`, `min > max`, and built-in
  shadowing are all decided and pinned by regressions; the enum transform
  regression pins the as-is `default` policy.

## Verdict

Coverage numbers are genuinely earned — the sweep pattern catches whole
classes of regressions by construction, and every policy decision is pinned
by an explicit regression. The remaining optional gap is an `is_fn_ctor`
sweep.
