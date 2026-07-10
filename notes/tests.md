# Test coverage & quality

*Part of the 2026-07-04 analysis; refreshed 2026-07-10.*

## Snapshot

- `npm test` (nyc + mocha): **1,199 passing, 3 pending**.
- **100% statement/branch/function/line coverage on every file** — rare and
  real; there is no istanbul-ignored code beyond three one-line fixture
  functions (`/* istanbul ignore next */` on the `x()` probes in
  `is_fn_async`/`is_fn_gen`/`is_fn_gen_async`).
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

- **Empty placeholder describe**: `built-in types • any` still contains zero
  tests. `obj` now has a dedicated transform-totality regression, but prop
  dropping, `optional`, array-as-props, and the undocumented `finish` comment
  remain uncovered in that section.
- **3 pending (`xit`) tests**: nullable-properties, optional-properties
  edge cases and `objects.dependable.hooks` (`src/make.test.js:486-489,585`)
  — plus two fully commented-out tests for a `from: 'pub_id'` property-rename
  feature that was never built (`src/make.test.js:563-584`). Dead intent;
  either implement or delete.
- **Remaining policy coverage**: array-as-props-source in `obj`, degenerate
  `min > max` ranges, and built-in registry precedence still need explicit
  decisions/tests. The enum transform regression now pins the current policy
  that an out-of-options `default` is returned as-is.

## Verdict

Coverage numbers are genuinely earned — the sweep pattern catches whole
classes of regressions by construction. Remaining gaps are mostly explicit
policy decisions, placeholder cleanup, and broader behavioral coverage.
