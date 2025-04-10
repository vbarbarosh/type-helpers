const assert = require('assert');
const edge_values = require('./edge_values');
const safe_obj = require('./safe_obj');

const empty_value = Symbol('empty_value for safe_obj');

describe('safe_obj', function () {
    it('should accept no args', function () {
        assert.deepStrictEqual(safe_obj(), {});
    });
    it('should return the empty_value for null, undefined, or NaN', function () {
        assert.strictEqual(safe_obj(null, empty_value), empty_value);
        assert.strictEqual(safe_obj(undefined, empty_value), empty_value);
        assert.strictEqual(safe_obj(NaN, empty_value), empty_value);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case '/./':
                case '{}':
                case '[]':
                    assert.strictEqual(safe_obj(item.value, empty_value), item.value);
                    break;
                default:
                    assert.strictEqual(safe_obj(item.value, empty_value), empty_value);
                    break;
                }
            });
        });
    });
});
