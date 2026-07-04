# Test coverage & quality

*Part of the 2026-07-04 analysis; see [overview.md](overview.md).*

## Snapshot

- `npm test` (nyc + mocha): **1,186 passing, 3 pending, 64 ms**.
- **100% statement/branch/function/line coverage on every file** — rare and
  real; there is no istanbul-ignored code beyond two one-line fixture
  functions (`/* istanbul ignore next */` on the `x()` probes in
  `is_fn_async`/`is_fn_gen`/`is_fn_gen_async`).
- Tests are colocated (`src/foo.test.js` next to `src/foo.js`) and excluded
  from the npm tarball via `files: ["!src/*.test.js"]`.

## The edge-values sweep pattern

The house style is the strongest part of the suite: every module has a
`describe('should handle edge values')` that iterates all ~50
`edge_values` and `switch`es on labels, with the `default` branch taking a
position on every value — so **adding a new edge value to the shared list
automatically confronts every function with it**. Plus a uniform
`it('should accept no args')` case per function.

Deviations from the house style:

- `is_fn_ctor` has no edge-values sweep (hand-picked cases only) — the one
  exception to README's "Every function in this library is tested this way".
- `make.test.js` doesn't sweep `edge_values` per built-in type (it has a
  smaller hand-rolled `edge cases` section for NaN/±Infinity). A
  `edge_values × {bool,int,float,str,array,obj}` matrix would pin `make`'s
  scalar behavior the same way the `safe_*` files are pinned.

## Holes in make.test.js

- **Empty placeholder describes**: `built-in types • any`
  (`src/make.test.js:59-60`) and `built-in types • obj`
  (`src/make.test.js:151-152`) contain zero tests. `obj` is exercised
  heavily via the sugar form elsewhere, but its named features
  (`transform`, `finish` (mentioned in the comment but unimplemented),
  `optional`, prop dropping) have no dedicated section; `any`'s
  `default`-on-undefined behavior is only tested indirectly.
- **3 pending (`xit`) tests**: nullable-properties, optional-properties
  edge cases and `objects.dependable.hooks` (`src/make.test.js:344-347,443`)
  — plus two fully commented-out tests for a `from: 'pub_id'` property-rename
  feature that was never built (`src/make.test.js:421-442`). Dead intent;
  either implement or delete.
- **Unpinned behaviors** (all currently reachable, none tested — see
  [correctness.md](correctness.md)): TypeError on truthy non-object exprs,
  reserved-key leak in the `type: [...]` escape hatch, array-as-props-source
  in `obj`, `transform`-returns-null crash, alias-cycle stack overflow,
  `enum` unvalidated default, `min > max` degenerate ranges. Whatever the
  intended semantics, each deserves a pinning test so 100% coverage means
  "100% of decided behavior", not just "100% of lines".

## Verdict

Coverage numbers are genuinely earned — the sweep pattern catches whole
classes of regressions by construction. The gaps are all in `make`'s
schema-author-error space, which is exactly where the library's "errors are
for programmers" philosophy says friendly behavior matters.
