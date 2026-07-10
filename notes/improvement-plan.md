# Improvement plan

*Current remaining work as of 2026-07-10. Completed items were removed; Git
history and regression tests preserve their rationale.*

## Phase 1 — behavior decisions

1. **`obj` with array input.** Decide whether arrays remain valid props
   sources. If kept, pin index and `length` behavior. If rejected, normalize
   them to an empty props source.
2. **Union without a valid default.** Document the existing throw as the
   exception to the library's total-normalizer model in README.
3. **Degenerate numeric ranges.** Decide whether `min > max` should keep
   resolving to `min` or throw a schema error, then pin the policy.
4. **Built-in registry precedence.** Decide whether custom types may shadow
   built-ins. Current behavior gives built-ins priority; add an explicit test
   if retained.

## Phase 2 — test debt

5. Fill the empty `built-in types • any` section with pass-through and
   default-on-undefined cases.
6. Expand the `obj` section with prop dropping, `optional`, and the array-input
   decision from Phase 1.
7. Add an `edge_values` matrix for `make` scalar types if the additional test
   volume is worthwhile.
8. Either add an `edge_values` sweep for `is_fn_ctor` or retain its targeted
   constructor tests as the documented exception.
9. Implement or delete the three `xit` placeholders and remove the two
   commented-out `from` tests for an unimplemented rename feature.

## Phase 3 — docs cleanup

10. Document `obj.transform`.
11. Document union options that reference registry type names.
12. Document enum default behavior and the union-without-default exception.
## Phase 4 — packaging

13. Add TypeScript declarations for `make` and deep-required helpers.
14. Remove the empty `dist/` directory.

## Explicitly deferred features

- New helpers such as `safe_array`, `is_int`, and comparison variants.
- New expression capabilities such as `record`, array `max`, and declarative
  string patterns.
- An ESM `exports` map, which could break existing deep requires.
