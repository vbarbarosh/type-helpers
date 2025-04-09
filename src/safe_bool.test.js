const assert = require('assert');
const edge_values = require('./edge_values');
const safe_bool = require('./safe_bool');

const SP = Symbol('empty_value for safe_bool');

describe('safe_bool', function () {
    it('should accept no args', function () {
        assert.strictEqual(safe_bool(), false);
    });
    it('should return the default value for null, undefined, or NaN', function () {
        assert.strictEqual(safe_bool(null, SP), SP);
        assert.strictEqual(safe_bool(undefined, SP), SP);
        assert.strictEqual(safe_bool(NaN, SP), SP);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'null':
                case 'undefined':
                case 'NaN':
                    assert.strictEqual(safe_bool(item.value, SP), SP);
                    break;
                default:
                    assert.strictEqual(safe_bool(item.value, SP), !!item.value);
                    break;
                }
            });
        });
    });
});
