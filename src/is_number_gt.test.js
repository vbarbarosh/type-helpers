const assert = require('assert');
const edge_values = require('./edge_values');
const is_number_gt = require('./is_number_gt');

describe('is_number_gt', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_number_gt(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case '0.49':
                case '0.50':
                case '0.51':
                case '1e100':
                case '1e-100':
                case 'Number.MIN_VALUE':
                case 'Number.MAX_VALUE':
                case 'Number.MAX_SAFE_INTEGER':
                    assert.strictEqual(is_number_gt(item.value, 0), true);
                    break;
                default:
                    assert.strictEqual(is_number_gt(item.value, 0), false);
                    break;
                }
            });
        });
    });
});
