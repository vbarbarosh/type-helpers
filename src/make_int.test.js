const assert = require('assert');
const edge_values = require('./edge_values');
const make_int = require('./make_int');

// https://exploringjs.com/impatient-js/ch_numbers.html#converting-to-number
//     https://exploringjs.com/js/book/ch_numbers.html#converting-to-number
// https://flaviocopes.com/how-to-convert-string-to-number-javascript/

const SP = Symbol('empty_value for make_int');

describe('make_int', function () {
    it('should accept no args', function () {
        assert.strictEqual(make_int(), 0);
    });
    it('should return the default value for null, undefined, or NaN', function () {
        assert.strictEqual(make_int(null, SP), SP);
        assert.strictEqual(make_int(undefined, SP), SP);
        assert.strictEqual(make_int(NaN, SP), SP);
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
                    assert.strictEqual(make_int(item.value, SP), 0);
                    break;
                case 'true':
                    assert.strictEqual(make_int(item.value, SP), 1);
                    break;
                case '1e100':
                case '10n**100n':
                case 'Infinity':
                case 'Number.MAX_VALUE':
                case 'Number.MAX_SAFE_INTEGER':
                case 'Number.POSITIVE_INFINITY':
                    assert.strictEqual(make_int(item.value, SP), Number.MAX_SAFE_INTEGER);
                    break;
                case '-(10n**100n)':
                case '-Infinity':
                case 'Number.MIN_SAFE_INTEGER':
                case 'Number.NEGATIVE_INFINITY':
                    assert.strictEqual(make_int(item.value, SP), Number.MIN_SAFE_INTEGER);
                    break;
                default:
                    assert.strictEqual(make_int(item.value, SP), SP);
                    break;
                }
            });
        });
    });
    describe('basic usage', function () {
        it('should convert -0 to 0', function () {
            assert.strictEqual(make_int(-0), 0);
        });
        it('should convert NaN to 0', function () {
            assert.strictEqual(make_int(NaN), 0);
        });
        it('should convert -Infinity to MIN_SAFE_INTEGER', function () {
            assert.strictEqual(make_int(-Infinity), Number.MIN_SAFE_INTEGER);
        });
        it('should convert +Infinity to MAX_SAFE_INTEGER', function () {
            assert.strictEqual(make_int(Infinity), Number.MAX_SAFE_INTEGER);
        });
        it('should convert Number.MIN_VALUE to 0', function () {
            assert.strictEqual(make_int(Number.MIN_VALUE), 0);
        });
        it('should convert -Number.MIN_VALUE to 0', function () {
            assert.strictEqual(make_int(-Number.MIN_VALUE), 0);
        });
        it('should convert Number.MAX_VALUE to MAX_SAFE_INTEGER', function () {
            assert.strictEqual(make_int(Number.MAX_VALUE), Number.MAX_SAFE_INTEGER);
        });
        it('should convert -Number.MAX_VALUE to Number.MIN_SAFE_INTEGER', function () {
            assert.strictEqual(make_int(-Number.MAX_VALUE), Number.MIN_SAFE_INTEGER);
        });
        it('should truncate fractional values', function () {
            assert.strictEqual(make_int(-1), -1);
            assert.strictEqual(make_int(-0.1), 0);
            assert.strictEqual(make_int(-0), 0);
            assert.strictEqual(make_int(0.1), 0);
            assert.strictEqual(make_int(4.49), 4);
            assert.strictEqual(make_int(4.50), 4);
            assert.strictEqual(make_int(4.55), 4);
        });
        it('should handle strings that can be converted to numbers', function () {
            assert.strictEqual(make_int(''), 0);
            assert.strictEqual(make_int('0'), 0);
            assert.strictEqual(make_int('-0'), 0);
            assert.strictEqual(make_int('123'), 123);
            assert.strictEqual(make_int('123.456'), 123);
            assert.strictEqual(make_int('  -789  '), -789);
        });
        it('should respect input value when default value was set', function () {
            assert.strictEqual(make_int(0, SP), 0);
            assert.strictEqual(make_int(0.1, SP), 0);
            assert.strictEqual(make_int(0.5, SP), 0);
            assert.strictEqual(make_int(0.55, SP), 0);
            assert.strictEqual(make_int(-0, SP), 0);
            assert.strictEqual(make_int(-0.1, SP), 0);
            assert.strictEqual(make_int(-0.5, SP), 0);
            assert.strictEqual(make_int(-0.51, SP), 0);
            assert.strictEqual(make_int(-0.55, SP), 0);
            assert.strictEqual(make_int(Number.MIN_VALUE, SP), 0);
            assert.strictEqual(make_int(Number.MIN_SAFE_INTEGER, SP), Number.MIN_SAFE_INTEGER);
        });
    });
});
