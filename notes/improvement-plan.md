# Improvement plan

*Current remaining work as of 2026-09-02. Completed items were removed; Git
history, regression tests, and [audit-2026-09-02.md](audit-2026-09-02.md)
preserve their rationale. All behavior decisions are made and pinned; what
remains is optional test breadth and packaging.*

## Phase 1 — test debt

1. Either add an `edge_values` sweep for `is_fn_ctor` or retain its targeted
   constructor tests as the documented exception.

## Phase 2 — packaging

2. Add TypeScript declarations for `make` and deep-required helpers.
3. Consider a `code` property (`E_SCHEMA` / `E_DATA`) on errors thrown by
   `make`, so callers can let schema errors crash while catching the two
   data-dependent ones (union without default, recursion depth) without
   matching on message text.
4. A `CHANGELOG.md`; tags and commit messages are descriptive enough to
   generate one.

## Explicitly deferred features

- New helpers such as `safe_array`, `is_int`, and comparison variants.
- New expression capabilities such as `record`, array `max`, and declarative
  string patterns.
- An ESM `exports` map, which could break existing deep requires.
