const assert = require('assert');
const edge_values = require('./edge_values');
const is_sym = require('./is_sym');

describe('is_sym', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_sym(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'Symbol()':
                    assert.strictEqual(is_sym(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_sym(item.value), false);
                    break;
                }
            });
        });
    });
});
