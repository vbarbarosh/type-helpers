const assert = require('assert');
const edge_values = require('./edge_values');
const is_empty = require('./is_empty');

describe('is_empty', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_empty(), true);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case '{}':
                case '[]':
                case '/./':
                case 'Math':
                    assert.strictEqual(is_empty(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_empty(item.value), !item.value);
                    break;
                }
            });
        });
    });
});
