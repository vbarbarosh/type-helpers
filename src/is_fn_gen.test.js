const assert = require('assert');
const edge_values = require('./edge_values');
const is_fn_gen = require('./is_fn_gen');

describe('is_fn_gen', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_fn_gen(), false);
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
