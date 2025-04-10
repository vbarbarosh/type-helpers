const assert = require('assert');
const edge_values = require('./edge_values');
const safe_obj = require('./safe_obj');

const SP = Symbol('empty_value for safe_obj');

describe('safe_obj', function () {
    it('should accept no args', function () {
        assert.deepStrictEqual(safe_obj(), {});
    });
    it('should return the empty_value for null, undefined, or NaN', function () {
        assert.strictEqual(safe_obj(null, SP), SP);
        assert.strictEqual(safe_obj(undefined, SP), SP);
        assert.strictEqual(safe_obj(NaN, SP), SP);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case '/./':
                case '{}':
                case '[]':
                    assert.strictEqual(safe_obj(item.value, SP), item.value);
                    break;
                default:
                    assert.strictEqual(safe_obj(item.value, SP), SP);
                    break;
                }
            });
        });
    });
});
