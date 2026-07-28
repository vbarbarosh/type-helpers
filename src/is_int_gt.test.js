const assert = require('assert');
const edge_values = require('./edge_values');
const is_int_gt = require('./is_int_gt');

describe('is_int_gt', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_int_gt(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case '1e100':
                case 'Number.MAX_VALUE':
                case 'Number.MAX_SAFE_INTEGER':
                    assert.strictEqual(is_int_gt(item.value, 0), true);
                    break;
                default:
                    assert.strictEqual(is_int_gt(item.value, 0), false);
                    break;
                }
            });
        });
    });
});
