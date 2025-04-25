## Inconsistencies

- check all snippets in README.md
- remove enum.transform
- remove obj.transform
+ Some types adjust default values, some - returns it without modifications:
    + `make({type: 'bool', default: 555}) -> 555` ⚠️
    + `make({type: 'int', default: 1, min: 100) -> 100`
    + `make({type: 'float', default: 1, min: 100) -> 100`
- What is the condition for returning default value?
    - null, undefined, or out of range (i.e. NaN, -inf, +inf)
+ 2 different signatures:
    + `make(expr, input, types)`
    + `bool: function (input, params)`
+ I don't like multiline `make({}, input)`. I would prefer `make(input, {})`.
+ make_float, make_int, make_bool - rename; they conflict with functions making types
+ all make_ functions should have the same signature
- "make" could be renamed to "bake" to justify its signature: bake(input, expr).

## Goals

- create object factories
    - make_background
    - make_border
    - make_color
    - make_color_stop
    - make_color_stops
- store object factories in a uniform way
- reuse object factories
    - make_color_stops: input => make({type: 'array', of: make_color_stop}, input)

```javascript
#!/usr/bin/env node

const make = require('.');

main();

async function main()
{
    console.log(make_border({size: '2', style: 'dashed'}));
}

// import const_item_background_format from '../const/const_item_background_format';
// import make_background_linear from './make_background_linear';
// import make_background_radial from './make_background_radial';
// import make_background_solid from './make_background_solid';
// import make_boolean from './make_boolean';
// import make_feed from './make_feed';
// import make_obj from './make_obj';

function make2(input, expr, types)
{
    return make(expr, input, types);
}

function make_background(input)
{
    return make2(input, {
        is_enabled: 'bool',
        feed: make_feed,
        format: {type: 'enum', options: ['solid', 'linear', 'radial']},
        solid: make_color,
        linear: {},
        radial: {},
        //solid: make_background_solid,
        //linear: make_background_linear,
        //radial: make_background_radial,
    });
}

function make_feed(input)
{
    return make2(input, {
        is_enabled: 'bool',
        is_fixed: 'bool',
        tag: 'str',
        fixed_position: 'int',
        start_position: 'int',
        step: {type: 'int', default: 1},
        is_product_id_tag_enabled: 'bool',
        product_id_tag: 'str',
    });
}

function make_color(input, params)
{
    const re = /^#[0-9a-f]{6}$/;
    if (is_str_match(input, re)) {
        return input;
    }
    if (is_str_match(params?.default, re)) {
        return params?.default;
    }
    return '#000000';
}

function make_border(input)
{
    return make2(input, {
        type: 'obj',
        props: {
            enabled: 'bool',
            radius: {type: 'int', min: 0, max: 999},
            color: {type: make_color, default: '#000000'},
            // https://developer.mozilla.org/en-US/docs/Web/CSS/border-style
            style: {type: 'enum', options: ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset']},
            size: {type: 'int', default: 1, min: 0, max: 100},
        },
        after: function (out) {
            if (out.style === 'none') {
                out.size = 0;
            }
            return out;
        },
    });
}

function is_str_match(input, re)
{
    return typeof input === 'string' && input.match(re);
}
```

## should throw a human-readable error when no type was found

```js
const s = make(input, 'strx');
```

## use-case: make can be used for expressive and safe way to extract parameters

```js
const types = {
    // {type: 'uid', prefix: 'banner_', engine: cuid|uuid|int}
    uid: function (input, params, types) {
        const {prefix, engine} = make(params, {prefix: 'str', engine: {type: 'enum', options: ['cuid', 'uuid', 'int']}});
        return `${prefix}a${next_uid++}`;
    },
}
```
