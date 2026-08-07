# Improvement plan

*Current remaining work as of 2026-08-07. Completed items were removed; Git
history and regression tests preserve their rationale. All behavior decisions
are made and pinned; what remains is optional test breadth and packaging.*

## Phase 1 — test debt

1. Add an `edge_values` matrix for `make` scalar types if the additional test
   volume is worthwhile.
2. Either add an `edge_values` sweep for `is_fn_ctor` or retain its targeted
   constructor tests as the documented exception.

## Phase 2 — packaging

3. Add TypeScript declarations for `make` and deep-required helpers.
4. Remove the empty `dist/` directory.

## Explicitly deferred features

- New helpers such as `safe_array`, `is_int`, and comparison variants.
- New expression capabilities such as `record`, array `max`, and declarative
  string patterns.
- An ESM `exports` map, which could break existing deep requires.
