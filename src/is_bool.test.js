const assert = require('assert');
const edge_values = require('./edge_values');
const is_bool = require('./is_bool');

describe('is_bool', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_bool(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'true':
                case 'false':
                    assert.strictEqual(is_bool(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_bool(item.value), false);
                    break;
                }
            });
        });
    });
});
