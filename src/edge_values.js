/**
 * A collection of JavaScript values which could cause unexpected behaviour.
 * Initially designed for use in tests in the following way:
 *
 *     describe('should handle edge values', function () {
 *         edge_values.forEach(function (item) {
 *             it(item.label, function () {
 *                 switch (item.label) {
 *                 case 'null':
 *                 case 'undefined':
 *                 case 'NaN':
 *                     assert.strictEqual(make_bool(item.value, SP), SP);
 *                     break;
 *                 default:
 *                     assert.strictEqual(make_bool(item.value, SP), !!item.value);
 *                     break;
 *                 }
 *             });
 *         });
 *     });
 *
 * Each test should add "should handle edge values" section, and handle each case. By
 * doing this, most of the edge cases will be automatically covered.
 */
const edge_values = [
    {label: "''", value: ''},
    {label: "'null'", value: 'null'},
    {label: "'undefined'", value: 'undefined'},
    {label: "'true'", value: 'true'},
    {label: "'false'", value: 'false'},
    {label: 'null', value: null},
    {label: 'undefined', value: undefined},
    {label: 'true', value: true},
    {label: 'false', value: false},
    {label: '/./', value: /./},
    {label: '0n', value: 0n},
    {label: '10n**100n', value: 10n**100n},
    {label: '1e100', value: 1e100},
    {label: '0', value: 0},
    {label: '-0', value: -0},
    {label: '-(10n**100n)', value: -(10n**100n)},
    {label: '1e-100', value: 1e-100},
    {label: 'NaN', value: NaN, description: `
        Result of invalid number operations:
          - const nan1 = 0 / 0;
          - const nan2 = Number('not a number');
          - const nan3 = Math.sqrt(-1);
    `},
    {label: 'Infinity', value: Infinity, description: `
        Division by zero:
          - const infinity1 = 1 / 0;
        Exceeding the maximum number:
          - const infinity2 = Number.MAX_VALUE * 2;
    `},
    {label: '-Infinity', value: -Infinity, description: `
        Negative division by zero:
          - const negInfinity1 = -1 / 0;
        Exceeding negative range:
          - const negInfinity2 = -Number.MAX_VALUE * 2;
    `},
    {label: 'Number.MIN_VALUE', value: Number.MIN_VALUE},
    {label: 'Number.MAX_VALUE', value: Number.MAX_VALUE},
    {label: 'Number.MIN_SAFE_INTEGER', value: Number.MIN_SAFE_INTEGER},
    {label: 'Number.MAX_SAFE_INTEGER', value: Number.MAX_SAFE_INTEGER},
    {label: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY},
    {label: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY},
    {label: '{}', value: {}},
    {label: '[]', value: []},
    {label: 'function', value: function () {}},
    {label: 'function*', value: function* () {}},
    {label: 'async function', value: async function () {}},
    {label: 'async function*', value: async function* () {}},
    {label: 'class Foo {}', value: class Foo {}},
    {label: 'class Foo { constructor() {} }', value: class Foo { constructor() {} }},
    {label: '() => 1', value: () => 1},
    {label: 'Symbol()', value: Symbol()},
];

// 🤯 -0 and NaN are the edge of edge cases
//
// [0, -0].indexOf(-0) -> 0
// [0, NaN].indexOf(NaN) -> -1
// new Set().add(0).has(-0) -> true
// new Set().add(-0).has(0) -> true
// new Set().add(NaN).has(NaN) -> true
// 0 === -0 -> true
// -0 === -0 -> true
// NaN === NaN -> false
// Object.is(0, -0) -> false
// Object.is(-0, -0) -> true
// Object.is(NaN, NaN) -> true
//
// ({})*1 -> NaN
// ([])*1 -> 0

module.exports = edge_values;
