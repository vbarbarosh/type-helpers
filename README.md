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

## Installation

```
npm install @vbarbarosh/type-helpers
```

## Motivation

1. Generate well-typed objects initialized from an untrusted source
2. Collect a set of functions for checking types in JavaScript
3. Edge Values: create a list of edge values in JavaScript. This should be
   checked by functions to ensure they will handle all possible inputs
   (separate `describe` section in test a `.test.js` file).

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
const tabs = make('tabs', body?.card, types);
```

## Basic usage

Creating basic types:

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

assert.strictEqual(make('int'), 0);
assert.strictEqual(make('int', -0), 0);
assert.strictEqual(make('int', '15.55'), 15);
assert.strictEqual(make('int', '15.999'), 15);

assert.strictEqual(make('float'), 0);
assert.strictEqual(make('float', -0), 0);
assert.strictEqual(make('float', '15.55'), 15.55);
assert.strictEqual(make('float', '15.999'), 15.999);

assert.strictEqual(make('bool', ''), false);
assert.strictEqual(make('bool', '1'), true);
assert.strictEqual(make('bool', 'x'), true);

assert.strictEqual(make('str', 1), '1');
assert.strictEqual(make('str', true), 'true');
assert.strictEqual(make('str', false), 'false');
```

Creating enum:

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

assert.strictEqual(make({type: 'enum', options: ['foo', 'bar', 'baz']}), 'foo');
assert.strictEqual(make({type: 'enum', options: ['foo', 'bar', 'baz']}, 'x'), 'foo');
assert.strictEqual(make({type: 'enum', options: ['foo', 'bar', 'baz']}, 'bar'), 'bar');
```

Creating uniform arrays (all values have the same type):

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

assert.deepStrictEqual(make({type: 'array', of: 'str'}), []);
assert.deepStrictEqual(make({type: 'array', of: 'str', min: 2}, 'x'), ['x', '']);
assert.deepStrictEqual(make({type: 'array', of: 'int', min: 2}, ['1']), [1, 0]);
```

Creating tuples (an array with fixed number of elements and predefined types):

```js
const assert = require('assert');
const make = require('@vbarbarosh/type-helpers');

assert.deepStrictEqual(make({type: 'tuple', items: ['str', 'str']}), ['', '']);
assert.deepStrictEqual(make({type: 'tuple', items: ['str', 'str']}, ['a']), ['a', '']);
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

assert.deepStrictEqual(make('rect', null, types), {width: 0, height: 0});
assert.deepStrictEqual(make('rect', {}, types), {width: 0, height: 0});
assert.deepStrictEqual(make('rect', {width: -100}, types), {width: 0, height: 0});
assert.deepStrictEqual(make('rect', {width: 15, height: 25}, types), {width: 15, height: 25});
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

assert.deepStrictEqual(make('widget', null, types), {kind: 'text', value: ''});
assert.deepStrictEqual(make('widget', {kind: 'submit'}, types), {kind: 'submit', label: '', name: '', value: ''});
```

## Built-in types

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

## Related

### Reading

* https://medium.com/hoppinger/type-driven-development-for-single-page-applications-bf8ee98d48e2
* https://medium.com/flow-type/types-first-a-scalable-new-architecture-for-flow-3d8c7ba1d4eb

### Tools

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
