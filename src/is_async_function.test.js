const assert = require('assert');
const edge_values = require('./edge_values');
const is_async_function = require('./is_async_function');

describe('is_async_function', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_async_function(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'async function':
                    assert.strictEqual(is_async_function(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_async_function(item.value), false);
                    break;
                }
            });
        });
    });
});
