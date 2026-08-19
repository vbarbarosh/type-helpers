const assert = require('assert');
const edge_values = require('./edge_values');
const is_fn_gen_async = require('./is_fn_gen_async');
const {describe, it} = require('node:test');

describe('is_fn_gen_async', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_fn_gen_async(), false);
    });
    it('should reject a non-function with an async generator prototype', function () {
        assert.strictEqual(is_fn_gen_async(Object.create(Object.getPrototypeOf(async function* () {}))), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'async function*':
                    assert.strictEqual(is_fn_gen_async(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_fn_gen_async(item.value), false);
                    break;
                }
            });
        });
    });
});
