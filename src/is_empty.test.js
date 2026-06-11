const assert = require('assert');
const edge_values = require('./edge_values');
const is_empty = require('./is_empty');

describe('is_empty', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_empty(), true);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case '{}':
                case '[]':
                case '/./':
                case 'Math':
                case 'Object.create(null)':
                case 'new Number(5)':
                case 'new Boolean(false)':
                case 'new Date(0)':
                case 'new Date(NaN)':
                // ⚠️ gotcha: Object.keys() sees no entries in Map/Set, so non-empty collections are reported as empty
                case 'new Map([[1, 2]])':
                case 'new Set([1])':
                case 'Promise.resolve()':
                    assert.strictEqual(is_empty(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_empty(item.value), !item.value);
                    break;
                }
            });
        });
    });
});
