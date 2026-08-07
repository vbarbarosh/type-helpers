# Docs & packaging

*Current snapshot as of 2026-07-10; see [overview.md](overview.md).*

## README.md

The README is thorough and its examples match current behavior, including
nullable hook precedence, the `type: [...]` escape hatch, edge-value test
coverage, and `empty_value` behavior.

No known documentation gaps remain: `obj.transform`, registry-name union
options, the union-without-default throw, and as-is enum defaults are all
covered by README.

## package.json / publishing

- `main: src/make.js` exports the `make` function; helpers remain available
  through deep requires.
- The tarball is clean: README, LICENSE, and non-test `src` files are shipped.
- Node 18 remains supported in the package and CI matrix. Direct development
  dependencies are at their latest Node-18-compatible releases.
- There are no runtime dependencies or production audit findings.
- There is no ESM entry or TypeScript declaration file. Type definitions are
  still the highest-leverage packaging improvement.

## Remaining repository cleanup

- `dist/` is empty and can be removed.
- `bin/release` and `bin/test` remain functional, but release operations are
  intentionally manual and outside automated agent workflows.
