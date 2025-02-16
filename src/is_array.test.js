const assert = require('assert');
const edge_values = require('./edge_values');
const is_array = require('./is_array');

describe('is_array', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_array(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case '[]':
                    assert.strictEqual(is_array(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_array(item.value), false);
                    break;
                }
            });
        });
    });
});
