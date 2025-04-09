## Inconsistencies

- Some types adjust default values, some - returns it without modifications:
    - `make({type: 'bool', default: 555}) -> 555` ⚠️
    - `make({type: 'int', default: 1, min: 100) -> 100`
    - `make({type: 'float', default: 1, min: 100) -> 100`
- What is the condition for returning default value?
    - null, undefined, or out of range (i.e. NaN, -inf, +inf)
- 3 different signatures:
    - `make(expr, input, types)`
    - `bool: function (input, params)`
    - `make_bool(input, default_value = false)`
- I don't like multiline `make({}, input)`. I would prefer `make(input, {})`.
