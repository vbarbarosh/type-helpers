# Scratchpad

## Open ideas

- Re-run README snippets as executable documentation.
- Build and reuse domain-specific object factories such as backgrounds,
  borders, colors, and feeds.
- Use custom function types for domain rules that the declarative core cannot
  express cleanly.
- Use `make` as a concise way to extract and normalize function parameters.

## Example: a reusable object factory

```js
const make = require('..');

function make_color(input, params)
{
    const re = /^#[0-9a-f]{6}$/;
    if (typeof input === 'string' && re.test(input)) {
        return input;
    }
    if (typeof params.default === 'string' && re.test(params.default)) {
        return params.default;
    }
    return '#000000';
}

function make_border(input)
{
    return make(input, {
        type: 'obj',
        props: {
            enabled: 'bool',
            radius: {type: 'int', min: 0, max: 999},
            color: {type: make_color, default: '#000000'},
            style: {type: 'enum', options: ['none', 'dotted', 'dashed', 'solid']},
            size: {type: 'int', default: 1, min: 0, max: 100},
        },
        after: out => out.style === 'none' ? {...out, size: 0} : out,
    });
}
```

## Example: parameter extraction

```js
const make = require('..');

const types = {
    uid: function (input, params) {
        const {prefix, engine} = make(params, {
            prefix: 'str',
            engine: {type: 'enum', options: ['cuid', 'uuid', 'int']},
        });
        // Generate the uid with the selected engine.
    },
};
```
