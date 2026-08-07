# Test coverage & quality

*Part of the 2026-07-04 analysis; refreshed 2026-07-10.*

## Snapshot

- `npm test` (nyc + mocha): **1,337 passing, 0 pending**.
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
have a `describe('should handle edge values')` that iterates all ~60
`edge_values` and `switch`es on labels, with the `default` branch taking a
position on every value — so **adding a new edge value to the shared list
automatically confronts every participating helper with it**. Plus a uniform
`it('should accept no args')` case per function. `make.test.js` sweeps the
same list across its scalar types in a `bool`/`int`/`float`/`str` matrix.

Deviations from the house style:

- `is_fn_ctor` has no edge-values sweep (hand-picked cases only). README now
  states this exception explicitly.
- `make`'s composite types (`array`, `obj`, `union`, …) rely on
  expression- and scenario-focused tests instead of edge sweeps.

## Holes in make.test.js

- The `obj` section now covers transform totality, nullish prop expressions,
  array-as-props, and prop dropping.
- **Policy coverage**: array-as-props in `obj`, `min > max`, and built-in
  shadowing are all decided and pinned by regressions; the enum transform
  regression pins the as-is `default` policy.

## Verdict

Coverage numbers are genuinely earned — the sweep pattern catches whole
classes of regressions by construction, and every policy decision is pinned
by an explicit regression. The remaining gaps are optional breadth: an
`is_fn_ctor` sweep and edge sweeps for composite types.
