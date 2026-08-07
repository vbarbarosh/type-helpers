const assert = require('assert');
const edge_values = require('./edge_values');
const is_fn_gen = require('./is_fn_gen');

describe('is_fn_gen', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_fn_gen(), false);
    });
    it('should reject a non-function with a generator prototype', function () {
        assert.strictEqual(is_fn_gen(Object.create(Object.getPrototypeOf(function* () {}))), false);
    });
    it('should not trust an own constructor property', function () {
        const fn = function () {};
        fn.constructor = (function* () {}).constructor;
        assert.strictEqual(is_fn_gen(fn), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'function*':
                    assert.strictEqual(is_fn_gen(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_fn_gen(item.value), false);
                    break;
                }
            });
        });
    });
});
