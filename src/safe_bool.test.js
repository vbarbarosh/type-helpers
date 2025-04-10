const assert = require('assert');
const edge_values = require('./edge_values');
const safe_bool = require('./safe_bool');

const empty_value = Symbol('empty_value for safe_bool');

describe('safe_bool', function () {
    it('should accept no args', function () {
        assert.strictEqual(safe_bool(), false);
    });
    it('should return the empty_value for null, undefined, or NaN', function () {
        assert.strictEqual(safe_bool(null, empty_value), empty_value);
        assert.strictEqual(safe_bool(undefined, empty_value), empty_value);
        assert.strictEqual(safe_bool(NaN, empty_value), empty_value);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'null':
                case 'undefined':
                case 'NaN':
                    assert.strictEqual(safe_bool(item.value, empty_value), empty_value);
                    break;
                default:
                    assert.strictEqual(safe_bool(item.value, empty_value), !!item.value);
                    break;
                }
            });
        });
    });
});
