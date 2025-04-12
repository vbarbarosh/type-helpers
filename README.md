Utilities for transforming raw input into safe and well-typed values and
objects.

<p align="center">
<a href="https://github.com/vbarbarosh/type-helpers/actions"><img src="https://github.com/vbarbarosh/type-helpers/actions/workflows/node.js.yml/badge.svg" alt="@vbarbarosh/node-helpers CI status" /></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/vbarbarosh/type-helpers" alt="License"></a>
<a href="https://www.npmjs.com/package/@vbarbarosh/type-helpers" rel="nofollow"><img src="https://img.shields.io/npm/dw/@vbarbarosh/type-helpers.svg" alt="npm"></a>
<a href="https://github.com/vbarbarosh/type-helpers" rel="nofollow"><img src="https://img.shields.io/github/stars/vbarbarosh/type-helpers" alt="stars"></a>
</p>

<p align="center">
<img src="img/logo-by-chat-gpt.webp" style="max-height:400px;">
</p>

## 💾 Installation

```
npm install @vbarbarosh/type-helpers
```

## 🎯 Motivation

1. Generate well-typed objects initialized from an untrusted source
2. Collect a set of functions for checking types in JavaScript
3. Edge Values: create a list of edge values in JavaScript. This should be
   checked by functions to ensure they will handle all possible inputs
   (separate `describe` section in a `.test.js` file).

```js
const types = {
    tab: {
        name: 'str',
        label: 'str',
        active: 'bool',
        disabled: 'bool',
    },
    tabs: {type: 'array', of: 'tab'}
};
const tabs = make(body?.card, 'tabs', types);
```

## ✨ Basic usage

`make(input, expr, types)`

Creating basic types:

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

assert.strictEqual(make(null, 'int'), 0);
assert.strictEqual(make(-0, 'int', -0), 0);
assert.strictEqual(make('15.55', 'int'), 15);
assert.strictEqual(make('15.999', 'int'), 15);

assert.strictEqual(make(null, 'float'), 0);
assert.strictEqual(make(-0, 'float'), 0);
assert.strictEqual(make('15.55', 'float'), 15.55);
assert.strictEqual(make('15.999', 'float'), 15.999);

assert.strictEqual(make('', 'bool'), false);
assert.strictEqual(make('1', 'bool'), true);
assert.strictEqual(make('x', 'bool'), true);

assert.strictEqual(make(1, 'str'), '1');
assert.strictEqual(make(true, 'str'), 'true');
assert.strictEqual(make(false, 'str'), 'false');
```

Creating enum:

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

assert.strictEqual(make(null, {type: 'enum', options: ['foo', 'bar', 'baz']}), 'foo');
assert.strictEqual(make('x', {type: 'enum', options: ['foo', 'bar', 'baz']}), 'foo');
assert.strictEqual(make('bar', {type: 'enum', options: ['foo', 'bar', 'baz']}), 'bar');
```

Creating uniform arrays (all values have the same type):

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

assert.deepStrictEqual(make(null, {type: 'array', of: 'str'}), []);
assert.deepStrictEqual(make('x', {type: 'array', of: 'str', min: 2}), ['x', '']);
assert.deepStrictEqual(make(['1'], {type: 'array', of: 'int', min: 2}), [1, 0]);
```

Creating tuples (an array with fixed number of elements and predefined types):

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

assert.deepStrictEqual(make(null, {type: 'tuple', items: ['str', 'str']}), ['', '']);
assert.deepStrictEqual(make(['a'], {type: 'tuple', items: ['str', 'str']}), ['a', '']);
```

Creating objects:

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

const types = {
    rect: {
        width: {type: 'int', min: 0},
        height: {type: 'int', min: 0},
    },
};

assert.deepStrictEqual(make(null, 'rect', types), {width: 0, height: 0});
assert.deepStrictEqual(make({}, 'rect', types), {width: 0, height: 0});
assert.deepStrictEqual(make({width: -100}, 'rect', types), {width: 0, height: 0});
assert.deepStrictEqual(make({width: 15, height: 25}, 'rect', types), {width: 15, height: 25});
```

Creating object unions (an object which shape is determined by value from a property):

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

const types = {
    widget: {
        type: 'union',
        prop: 'kind',
        default: 'text',
        options: {
            text: {
                value: 'str',
            },
            number: {
                value: 'float',
                min: 'float',
                max: 'float',
                step: {type: 'float', min: 0.001, default: 1},
            },
            submit: {
                label: 'str',
                name: 'str',
                value: 'str',
            },
        },
    },
};

assert.deepStrictEqual(make(null, 'widget', types), {kind: 'text', value: ''});
assert.deepStrictEqual(make({kind: 'submit'}, 'widget', types), {kind: 'submit', label: '', name: '', value: ''});
```

## Expressions

`make(input, expr, types)`

In general, an expression is an object with the following **reserved**
properties:

| Name       | Type                    | Description                                                                                                            |
|------------|-------------------------|------------------------------------------------------------------------------------------------------------------------|
| `type`     | `string`<br/>`function` | Either the name of a built-in or user-defined type, or a function with 3 arguments: `function (input, params, types)`. |
| `nullable` | `boolean`               | If it evaluates to `true`, then the value could be `null`.                                                             |
| `before`   | `function`              | A preprocessor for input data: `before(input)`.                                                                        |
| `after`    | `function`              | A postprocessor for output data: `after(out)`.                                                                         |

When **nullable** evaluates to `true`, `make` will return `null` when **input**
is either `null` or `undefined`.

Depending on the type, `expr` might have more properties. For example, `{type:
'int'}` expects `min`, `max`, and `default`, while `{type: 'enum'}` expects an
`options` array.

As syntactic sugar, the expression could be a `string`, a `function`, or an
`object` without the **reserved** property `type`. In that case, it is treated
as `{type: expr}`.

| Type       | Example                                                                                          |
|------------|--------------------------------------------------------------------------------------------------|
| `string`   | `make(input, 'int')` →<br/>`make(input, {type: 'int'}`)                                          |
| `function` | `make(input, v => [${v}])`→<br/>`make(input, {type: v => [${v}]})`                               |
| `object`   | `make(input, {w: 'int', h: 'int})`→<br/>`make(input, {type: 'obj', props: {w: 'int', h: 'int}})` |

## 📦 Built-in types

### raw

```js
{type: 'raw', nullable: false, before: input => input, after: out => out}
```

### any

```js
{type: 'any', default: undefined, nullable: false, before: input => input, after: out => out}
```

### null

```js
{type: 'null', nullable: false, before: input => input, after: out => out}
```

### const

```js
{type: 'const', value: 123, nullable: false, before: input => input, after: out => out}
```

### bool

```js
{type: 'bool', default: false, nullable: false, before: input => input, after: out => out}
```

### int

```js
{type: 'int', min: 0, max: 100, default: 0, nullable: false, before: input => input, after: out => out}
```

### float

```js
{type: 'float', min: 0, max: 100, default: 0, nullable: false, before: input => input, after: out => out}
```

### str

```js
{type: 'str', default: 'foo', nullable: false, before: input => input, after: out => out}
```

### array

```js
{type: 'array', of: __type__, min: 0, nullable: false, before: input => input, after: out => out}
```

### tuple

```js
{type: 'tuple', items: [], nullable: false, before: input => input, after: out => out}
```

### enum

```js
{type: 'enum', options: [], transform: v => v, nullable: false, before: input => input, after: out => out}
```

### tags

```js
{type: 'tags', options: ['foo', 'bar', 'baz'], nullable: false, before: input => input, after: out => out}
```

### obj

```js
{type: 'obj', props: {...}, transform: v => v, finish: v => v, nullable: false, before: input => input, after: out => out}
```

### union

```js
{type: 'union', prop: 'kind', options: {...}, nullable: false, before: input => input, after: out => out}
```

## 🎁 Bonus

There are several `safe_` functions. They guarantee a valid result by falling
back to `empty_value` if the `input` is `null`, `undefined`, or cannot be safely
represented in the requested type.

- [`safe_bool(input, empty_value = false)`](src/safe_bool.js)
- [`safe_float(input, empty_value = 0, min = -Number.MAX_VALUE, max = Number.MAX_VALUE)`](src/safe_float.js)
- [`safe_int(input, empty_value = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER)`](src/safe_int.js)
- [`safe_obj(input, empty_value = {})`](src/safe_obj.js)
- [`safe_str(input, empty_value = '')`](src/safe_str.js)

⚠️ Note that `empty_value` is returned without additional type conversion. This is intentional.

## 🔗 Related

### 📚 Reading

* https://medium.com/hoppinger/type-driven-development-for-single-page-applications-bf8ee98d48e2
* https://medium.com/flow-type/types-first-a-scalable-new-architecture-for-flow-3d8c7ba1d4eb

### 🧰 Tools

* https://zod.dev/
* https://www.npmjs.com/package/schema-object
* https://www.npmjs.com/package/@humanwhocodes/object-schema
* https://www.npmjs.com/package/@eslint/object-schema
* https://json-schema.org
* https://domsignal.com/json-schema-generator
* https://github.com/sourcemeta/awesome-jsonschema
* https://github.com/jquense/yup
* https://github.com/gcanti/io-ts
* https://github.com/typestack/class-transformer
* https://valibot.dev/blog/valibot-v1-the-1-kb-schema-library/
