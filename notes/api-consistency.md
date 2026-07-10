# API design & consistency

*Part of the 2026-07-04 analysis; refreshed 2026-07-10.*

## What is consistent (and deliberately so)

- Naming: uniform `snake_case`, uniform prefixes (`is_*` → boolean,
  `safe_*` → total coercion with fallback), one function per file, filename
  = function name = export.
- Signatures: every `is_*` takes a single value (except `is_num_gt(input, min)`);
  every `safe_*` is `(input, empty_value, ...)` with `empty_value` returned
  **verbatim** (no coercion) — documented as intentional so `null` makes
  invalid input detectable (`src/safe_int.js:1-3`, README ⚠️ note).
- `null`/`undefined`/`NaN` uniformly map to `empty_value` across
  `safe_bool/int/float` and to defaults inside `make`'s scalar types.
- `-0` is normalized to `0` everywhere it can leak out (`safe_int`,
  `safe_float` via `||0`; `safe_str` via `Object.is(input, -0)` → `'0'`).
- Numeric-string semantics are the `*1` family (`'1e3'` → 1000, `'0x1F'` → 31,
  `' 42 '` → 42, `'12px'` → reject), consistently in both `safe_int` and
  `safe_float`, all pinned by tests.
- Built-in/custom type registries, union options, and enum transform maps use
  own-property lookup; inherited names are not treated as schema entries.

## Inconsistencies worth knowing about

1. **Objects: `safe_bool` accepts, `safe_int`/`safe_float`/`safe_str` reject.**
   `safe_bool({})` → `true` (plain truthiness), while
   `safe_float({})`/`safe_int({})`/`safe_str({})` → `empty_value`
   (explicit `case 'object'` rejection). Defensible (bool-of-existence) but
   it is the one `safe_*` that follows JS truthiness instead of "reject
   what can't be represented" — e.g. `new Boolean(false)` → `true`.

2. **Arrays: `is_obj` excludes them, `safe_obj` accepts them.**
   `is_obj([])` → `false` (`src/is_obj.js:3`), but
   `safe_obj([])` → the array itself (`src/safe_obj.js:11` only checks
   `typeof input === 'object' && input !== null`). This leaks into `make`:
   the `obj` type builds props off `safe_obj(input)`, so an **array input is
   treated as a props source** — `make(['a','b'], {0:'str', length:'int'})`
   → `{"0":"a","length":2}` (verified). Same for `Map`/`Set`/boxed
   primitives (own-prop lookup yields undefined → defaults, harmless).

3. **Function-kind detection uses two different mechanisms.**
   `is_fn_gen` compares `input.constructor` (spoofable by assigning
   `.constructor`; guarded by `typeof input === 'function'`), while
   `is_fn_async`/`is_fn_gen_async` compare `Object.getPrototypeOf(input)`
   (spoofable by `Object.setPrototypeOf`; guarded by a null/undefined check
   and rely on autoboxing for primitives). Both work for honest values;
   picking one mechanism would be more uniform.

4. **`is_fn_ctor` is the only helper without an `edge_values` sweep.**
   Its tests are hand-picked true/false lists (`src/is_fn_ctor.js` test
   block). README documents this targeted-test exception. It also special-cases
   `Symbol` because `Reflect.construct(String, [], Symbol)` succeeds although
   `new Symbol()` throws.

5. **`enum` default is unvalidated; `union` default is validated.**
   `{type:'enum', options:['a'], default:'zzz'}` returns `'zzz'` even though
   it is not an option. A regression pins this policy with a sentinel default
   outside `options`. `union` by contrast resolves
   `params.default` against `options` and throws when it doesn't resolve. Two
   different policies for the same concept.
   (Still idempotent — the out-of-options default keeps mapping to itself.)

6. **Registry cannot shadow built-ins, silently.** `standard_types` is
   checked before `types`, so
   `make('5', 'int', {int: myFn})` ignores the custom entry (verified:
   returns `5`). Reasonable precedence, but no warning; a registry author
   gets no signal their `int`/`str`/`obj` entry is dead.

7. **bigint round-trip is lossy by design.** `safe_str(10n)` → `'10'` (no
   `n` suffix; flagged ⚠️ in `src/safe_str.js`), `safe_int/float` convert
   via `Number()` (precision loss beyond 2^53, clamped) — all pinned in
   tests, just don't expect reversibility.

## Gaps (absent, would fit the existing idiom)

- `safe_array` — the only `make` built-in scalar family without a
  standalone `safe_*` counterpart.
- `is_int` (`Number.isInteger` wrapper), `is_num_gte`/`is_num_lt` siblings
  for `is_num_gt`.
- `array` has `min` but no `max`; no `record` type (dynamic keys) — both
  already catalogued as design gaps in [shape.md](shape.md).
