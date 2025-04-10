const assert = require('assert');
const edge_values = require('./edge_values');
const safe_float = require('./safe_float');

const empty_value = Symbol('empty_value for safe_float');

describe('safe_float', function () {
    it('should accept no args', function () {
        assert.strictEqual(safe_float(), 0);
    });
    it('should return the empty_value for null, undefined, or NaN', function () {
        assert.strictEqual(safe_float(null, empty_value), empty_value);
        assert.strictEqual(safe_float(undefined, empty_value), empty_value);
        assert.strictEqual(safe_float(NaN, empty_value), empty_value);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'null':
                case 'undefined':
                case 'NaN':
                    assert.strictEqual(safe_float(item.value, empty_value), empty_value);
                    break;
                case "''":
                case 'false':
                case '0':
                case '-0':
                case '0n':
                    assert.strictEqual(safe_float(item.value, empty_value), 0);
                    break;
                case '0.49':
                case '0.50':
                case '0.51':
                case '-0.49':
                case '-0.50':
                case '-0.51':
                case '1e100':
                case '1e-100':
                case 'Number.MIN_VALUE':
                case 'Number.MAX_VALUE':
                case 'Number.MIN_SAFE_INTEGER':
                case 'Number.MAX_SAFE_INTEGER':
                    assert.strictEqual(safe_float(item.value, empty_value), item.value);
                    break;
                case '10n**100n':
                    assert.strictEqual(safe_float(item.value, empty_value), 1e100);
                    break;
                case '-(10n**100n)':
                    assert.strictEqual(safe_float(item.value, empty_value), -1e100);
                    break;
                case 'true':
                    assert.strictEqual(safe_float(item.value, empty_value), 1);
                    break;
                case 'Infinity':
                case 'Number.POSITIVE_INFINITY':
                    assert.strictEqual(safe_float(item.value, empty_value), Number.MAX_VALUE);
                    break;
                case '-Infinity':
                case 'Number.NEGATIVE_INFINITY':
                    assert.strictEqual(safe_float(item.value, empty_value), -Number.MAX_VALUE);
                    break;
                default:
                    assert.strictEqual(safe_float(item.value, empty_value), empty_value);
                    break;
                }
            });
        });
    });
});
