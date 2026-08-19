const assert = require('assert');
const edge_values = require('./edge_values');
const is_str = require('./is_str');

describe('is_str', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_str(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case "''":
                case "'null'":
                case "'undefined'":
                case "'true'":
                case "'false'":
                case "'123'":
                case "'15.99'":
                case "' 42 '":
                case "'1e3'":
                case "'0x1F'":
                case "'Infinity'":
                case "'12px'":
                case "'0'":
                case "' '":
                case "'NaN'":
                case "'1_000'":
                case "'\\ufeff'":
                case "'a\\0b'":
                case "'\\ud800'":
                case "'\\udfff'":
                case "'\\udc00\\ud800'":
                case "'a\\ud800b'":
                    assert.strictEqual(is_str(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_str(item.value), false);
                    break;
                }
            });
        });
    });
});
