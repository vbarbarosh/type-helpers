# Improvement plan

*Follow-up to the 2026-07-04 analysis ([overview.md](overview.md)). Ordered
so that decisions come first (they gate later steps), then mechanical fixes,
then docs/packaging. Each fix lands together with the test that pins it.*

## Phase 0 — decisions to make first

These are policy calls only the author can make; everything in Phase 1–3
that depends on one is marked with the decision letter.

- **(A) `obj.transform` and `enum.transform`: keep or remove?**
  [scratchpad.md](scratchpad.md) says remove both; README meanwhile
  documents `enum.transform` as a headline feature and tests rely on
  `obj.transform`. Recommendation: keep both (they carry real migration
  use cases), delete the scratchpad lines, and document `obj.transform`
  in README.
- **(B) `enum` default validation.** Today an out-of-options `default` is
  returned as-is; `union` validates its default. Recommendation: leave
  behavior as is (it's total and idempotent) and document it — validating
  would be a breaking change with little payoff.
- **(C) `obj` with array input.** Today arrays are a props source
  (`make(['a','b'], {0:'str'})` works). Recommendation: keep — it falls out
  of `safe_obj` and index-keyed props are occasionally useful — but pin it
  with a test so it's decided behavior, not an accident.
- **(D) `union` without `default` throwing on data.** Recommendation:
  keep the throw (a silent fallback would invent semantics) and document it
  as the single data-dependent error, in both README and shape.md.

## Phase 1 — correctness hardening in `src/make.js` (small diffs, no API breaks)

1. **Friendly error for non-object exprs.** Before the `'type' in expr`
   check (`make.js:176`), reject anything that isn't a string, function, or
   object with `throw new Error('Invalid expression: ' + ...)`. Kills the
   raw `TypeError` from `make(x, true)` / `{flag: true}` prop specs
   ([correctness.md](correctness.md) §1).
2. **Strip reserved keys in the `type: [...]` escape hatch.** When
   converting the expr to props (`make.js:181`), drop
   `nullable`/`before`/`after` from the props object (they were already
   honored at the expr level). Fixes [correctness.md](correctness.md) §2.
3. **Total `obj.transform`.** Wrap the transform result:
   `safe_obj(params.transform(input))` (`make.js:128`). Fixes §4. *(Skip if
   decision A removes transform.)*
4. **Alias-cycle guard.** Thread a `Set` of visited registry names through
   the alias-resolution path (`make.js:210`); on revisit, throw
   `Error('Circular type alias: ...')`. Turns the stack overflow of §5 into
   a readable schema error. Leave data-driven recursion
   (`of: 'node', min: 1`) alone — it's documented in shape.md.

Each item ships with its pinning test in the same change. Target version:
0.2.x (nothing above changes documented behavior).

## Phase 2 — test debt in `src/make.test.js`

5. Fill the empty `built-in types • any` and `built-in types • obj`
   describes: `any` default-on-undefined; `obj` prop dropping, `optional`,
   `transform` (per decision A), array-as-props (per decision C).
6. Pin the remaining decided-but-untested behaviors: enum default policy
   (B), `min > max` degenerate ranges, registry-cannot-shadow-built-ins.
7. Add an `edge_values` sweep over `make`'s scalar types
   (`bool/int/float/str`) mirroring the `safe_*` house style.
8. Give `is_fn_ctor` an `edge_values` sweep, making README's "every
   function is tested this way" true.
9. Delete the two commented-out `from: 'pub_id'` tests
   (`make.test.js:421-442`) and either implement or delete the three `xit`
   placeholders.

## Phase 3 — docs cleanup

10. README: document `obj.transform` (per A), the union-without-default
    throw (per D), enum default behavior (per B), and union options
    referencing registry type names.
11. [shape.md](shape.md): one-line caveat sharpening "no error channel for
    data" with the union exception (D).
12. [scratchpad.md](scratchpad.md): delete resolved/contradicted items (bool-default-555,
    remove-transform lines, human-readable-error wish); keep only live ideas.
13. `demos/table-columns.js:16`: define a local `format_date_human` stub
    (or drop the `Updated` column) so `read()` is callable.
14. `rmdir dist/`.

## Phase 4 — packaging (independent, highest user-facing leverage)

15. **Ship type definitions.** Hand-written `index.d.ts` + per-helper
    `src/*.d.ts` (deep requires must stay typed), added to `files`. The
    expr DSL can start loosely typed (`type Expr = string | Function |
    Record<string, any>`) and tighten later — even that unblocks editor
    completion for every consumer.

## Explicitly deferred (scope changes, not cleanups)

- New helpers (`safe_array`, `is_int`, `is_num_gte`) — add on first real
  need, not speculatively.
- New `make` capabilities from shape.md's gap list (`record` type, `array`
  `max`, declarative string patterns) — each is a feature with design
  questions of its own.
- ESM `exports` map — deferred until there's a concrete ESM consumer;
  adding one risks breaking existing deep requires.
