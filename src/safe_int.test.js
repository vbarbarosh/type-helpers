const assert = require('assert');
const edge_values = require('./edge_values');
const safe_int = require('./safe_int');

// https://exploringjs.com/impatient-js/ch_numbers.html#converting-to-number
//     https://exploringjs.com/js/book/ch_numbers.html#converting-to-number
// https://flaviocopes.com/how-to-convert-string-to-number-javascript/

const empty_value = Symbol('empty_value for safe_int');

describe('safe_int', function () {
    it('should accept no args', function () {
        assert.strictEqual(safe_int(), 0);
    });
    it('should return the empty_value for null, undefined, or NaN', function () {
        assert.strictEqual(safe_int(null, empty_value), empty_value);
        assert.strictEqual(safe_int(undefined, empty_value), empty_value);
        assert.strictEqual(safe_int(NaN, empty_value), empty_value);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case "''":
                case 'false':
                case '0':
                case '0n':
                case '1e-100':
                case '-0':
                case 'Number.MIN_VALUE':
                case '0.49':
                case '0.50':
                case '0.51':
                case '-0.49':
                case '-0.50':
                case '-0.51':
                    assert.strictEqual(safe_int(item.value, empty_value), 0);
                    break;
                case 'true':
                    assert.strictEqual(safe_int(item.value, empty_value), 1);
                    break;
                case '1e100':
                case '10n**100n':
                case 'Infinity':
                case 'Number.MAX_VALUE':
                case 'Number.MAX_SAFE_INTEGER':
                case 'Number.POSITIVE_INFINITY':
                    assert.strictEqual(safe_int(item.value, empty_value), Number.MAX_SAFE_INTEGER);
                    break;
                case '-(10n**100n)':
                case '-Infinity':
                case 'Number.MIN_SAFE_INTEGER':
                case 'Number.NEGATIVE_INFINITY':
                    assert.strictEqual(safe_int(item.value, empty_value), Number.MIN_SAFE_INTEGER);
                    break;
                default:
                    assert.strictEqual(safe_int(item.value, empty_value), empty_value);
                    break;
                }
            });
        });
    });
    describe('basic usage', function () {
        it('should convert -0 to 0', function () {
            assert.strictEqual(safe_int(-0), 0);
        });
        it('should convert NaN to 0', function () {
            assert.strictEqual(safe_int(NaN), 0);
        });
        it('should convert -Infinity to MIN_SAFE_INTEGER', function () {
            assert.strictEqual(safe_int(-Infinity), Number.MIN_SAFE_INTEGER);
        });
        it('should convert +Infinity to MAX_SAFE_INTEGER', function () {
            assert.strictEqual(safe_int(Infinity), Number.MAX_SAFE_INTEGER);
        });
        it('should convert Number.MIN_VALUE to 0', function () {
            assert.strictEqual(safe_int(Number.MIN_VALUE), 0);
        });
        it('should convert -Number.MIN_VALUE to 0', function () {
            assert.strictEqual(safe_int(-Number.MIN_VALUE), 0);
        });
        it('should convert Number.MAX_VALUE to MAX_SAFE_INTEGER', function () {
            assert.strictEqual(safe_int(Number.MAX_VALUE), Number.MAX_SAFE_INTEGER);
        });
        it('should convert -Number.MAX_VALUE to Number.MIN_SAFE_INTEGER', function () {
            assert.strictEqual(safe_int(-Number.MAX_VALUE), Number.MIN_SAFE_INTEGER);
        });
        it('should truncate fractional values', function () {
            assert.strictEqual(safe_int(-1), -1);
            assert.strictEqual(safe_int(-0.1), 0);
            assert.strictEqual(safe_int(-0), 0);
            assert.strictEqual(safe_int(0.1), 0);
            assert.strictEqual(safe_int(4.49), 4);
            assert.strictEqual(safe_int(4.50), 4);
            assert.strictEqual(safe_int(4.55), 4);
        });
        it('should handle strings that can be converted to numbers', function () {
            assert.strictEqual(safe_int(''), 0);
            assert.strictEqual(safe_int('0'), 0);
            assert.strictEqual(safe_int('-0'), 0);
            assert.strictEqual(safe_int('123'), 123);
            assert.strictEqual(safe_int('123.456'), 123);
            assert.strictEqual(safe_int('  -789  '), -789);
        });
        it('should respect input value when empty_value was set', function () {
            assert.strictEqual(safe_int(0, empty_value), 0);
            assert.strictEqual(safe_int(0.1, empty_value), 0);
            assert.strictEqual(safe_int(0.5, empty_value), 0);
            assert.strictEqual(safe_int(0.55, empty_value), 0);
            assert.strictEqual(safe_int(-0, empty_value), 0);
            assert.strictEqual(safe_int(-0.1, empty_value), 0);
            assert.strictEqual(safe_int(-0.5, empty_value), 0);
            assert.strictEqual(safe_int(-0.51, empty_value), 0);
            assert.strictEqual(safe_int(-0.55, empty_value), 0);
            assert.strictEqual(safe_int(Number.MIN_VALUE, empty_value), 0);
            assert.strictEqual(safe_int(Number.MIN_SAFE_INTEGER, empty_value), Number.MIN_SAFE_INTEGER);
        });
    });
});
