const assert = require('assert');
const edge_values = require('./edge_values');
const is_generator = require('./is_generator');

describe('is_generator', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_generator(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'function*':
                    assert.strictEqual(is_generator(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_generator(item.value), false);
                    break;
                }
            });
        });
    });
});
