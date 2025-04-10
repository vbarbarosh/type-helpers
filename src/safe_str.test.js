const assert = require('assert');
const edge_values = require('./edge_values');
const safe_str = require('./safe_str');

const empty_value = Symbol('empty_value for safe_str');

describe('safe_str', function () {
    it('should accept no args', function () {
        assert.strictEqual(safe_str(), '');
    });
    it('should return the empty_value for null, undefined, or NaN', function () {
        assert.strictEqual(safe_str(null, empty_value), empty_value);
        assert.strictEqual(safe_str(undefined, empty_value), empty_value);
        assert.strictEqual(safe_str(NaN, empty_value), empty_value);
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
                    assert.strictEqual(safe_str(item.value, empty_value), item.value);
                    break;
                case 'true':
                case 'false':
                case '0.49':
                case '0.50':
                case '0.51':
                case '-0.49':
                case '-0.50':
                case '-0.51':
                case '0n':
                case '10n**100n':
                case '1e100':
                case '0':
                case '-(10n**100n)':
                case '1e-100':
                case 'Number.MIN_VALUE':
                case 'Number.MAX_VALUE':
                case 'Number.MIN_SAFE_INTEGER':
                case 'Number.MAX_SAFE_INTEGER':
                    assert.strictEqual(safe_str(item.value, empty_value), item.value.toString());
                    break;
                case '-0':
                    assert.strictEqual(safe_str(item.value, empty_value), '0');
                    break;
                default:
                    assert.strictEqual(safe_str(item.value, empty_value), empty_value);
                    break;
                }
            });
        });
    });
    describe('basic usage', function () {
        it('should convert Number to string', function () {
            assert.strictEqual(safe_str(555), '555');
        });
    });
});
