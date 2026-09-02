# Docs & packaging

*Current snapshot as of 2026-09-02; see [overview.md](overview.md).*

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
- `engines: node >= 22`, matching the CI matrix (22/24) and the test
  script, which needs `--test-coverage-exclude` (Node ≥ 22.5). Node 18 and
  20 are EOL; the runtime code itself needs nothing newer than
  `Object.hasOwn`, but nothing verifies older versions anymore.
- There are no dependencies at all — the demo's helpers were inlined so
  `npm ci` installs nothing — and no audit findings.
- `homepage` and `sideEffects: false` are set.
- There is no ESM entry or TypeScript declaration file. Type definitions are
  still the highest-leverage packaging improvement.

## Repository

- `bin/release` publishes to npm before pushing, so a failed publish leaves
  only a local tag. Release operations are intentionally manual and outside
  automated agent workflows.
- CI runs with `permissions: contents: read`; Dependabot watches npm and
  GitHub Actions monthly.
