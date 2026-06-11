const assert = require('assert');
const edge_values = require('./edge_values');
const is_obj = require('./is_obj');

describe('is_obj', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_obj(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case '/./':
                case '{}':
                case 'Math':
                case 'Object.create(null)':
                case 'new Number(5)':
                case "new String('5')":
                case 'new Boolean(false)':
                case 'new Date(0)':
                case 'new Date(NaN)':
                case 'new Map([[1, 2]])':
                case 'new Set([1])':
                case 'Promise.resolve()':
                    assert.strictEqual(is_obj(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_obj(item.value), false);
                    break;
                }
            });
        });
    });
});
