# Test coverage & quality

*Part of the 2026-07-04 analysis; refreshed 2026-07-10.*

## Snapshot

- `npm test` (nyc + mocha): **1,268 passing, 0 pending**.
- **100% statement/branch/function/line coverage on every implementation
  file** — `edge_values.js` is fixture data (its function values are never
  meant to run) and is excluded from instrumentation via the `nyc` config in
  package.json; its own test asserts list integrity (unique labels, `value`
  present). The only istanbul-ignored code is the three one-line `x()` probes
  in `is_fn_async`/`is_fn_gen`/`is_fn_gen_async`.
- Tests are colocated (`src/foo.test.js` next to `src/foo.js`) and excluded
  from the npm tarball via `files: ["!src/*.test.js"]`.

## The edge-values sweep pattern

The house style is the strongest part of the suite: most standalone helpers
have a `describe('should handle edge values')` that iterates all ~50
`edge_values` and `switch`es on labels, with the `default` branch taking a
position on every value — so **adding a new edge value to the shared list
automatically confronts every participating helper with it**. Plus a uniform
`it('should accept no args')` case per function.

Deviations from the house style:

- `is_fn_ctor` has no edge-values sweep (hand-picked cases only). README now
  states this exception explicitly.
- `make.test.js` doesn't sweep `edge_values` per built-in type (it has a
  smaller hand-rolled `edge cases` section for NaN/±Infinity). A
  `edge_values × {bool,int,float,str,array,obj}` matrix would pin `make`'s
  scalar behavior the same way the `safe_*` files are pinned.

## Holes in make.test.js

- **obj section gaps**: `obj` has dedicated transform-totality,
  nullish-prop-expression, and array-as-props regressions, but prop dropping
  remains uncovered in that section.
- **Policy coverage**: array-as-props in `obj`, `min > max`, and built-in
  shadowing are all decided and pinned by regressions; the enum transform
  regression pins the as-is `default` policy.

## Verdict

Coverage numbers are genuinely earned — the sweep pattern catches whole
classes of regressions by construction. Remaining gaps are mostly explicit
policy decisions, placeholder cleanup, and broader behavioral coverage.
