# Improvement plan

*Current remaining work as of 2026-07-10. Completed items were removed; Git
history and regression tests preserve their rationale.*

## Phase 1 — behavior decisions

1. **`obj` with array input.** Decide whether arrays remain valid props
   sources. If kept, pin index and `length` behavior. If rejected, normalize
   them to an empty props source.
2. **Union without a valid default.** Document the existing throw as the
   exception to the library's total-normalizer model in README.
3. **Built-in registry precedence.** Decide whether custom types may shadow
   built-ins. Current behavior gives built-ins priority; add an explicit test
   if retained.

## Phase 2 — test debt

5. Expand the `obj` section with prop dropping, `optional`, and the array-input
   decision from Phase 1.
6. Add an `edge_values` matrix for `make` scalar types if the additional test
   volume is worthwhile.
7. Either add an `edge_values` sweep for `is_fn_ctor` or retain its targeted
   constructor tests as the documented exception.

## Phase 3 — packaging

8. Add TypeScript declarations for `make` and deep-required helpers.
9. Remove the empty `dist/` directory.

## Explicitly deferred features

- New helpers such as `safe_array`, `is_int`, and comparison variants.
- New expression capabilities such as `record`, array `max`, and declarative
  string patterns.
- An ESM `exports` map, which could break existing deep requires.
