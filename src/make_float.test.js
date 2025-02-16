const assert = require('assert');
const edge_values = require('./edge_values');
const make_float = require('./make_float');

const SP = Symbol('default_value for make_float');

describe('make_float', function () {
    it('should accept no args', function () {
        assert.strictEqual(make_float(), 0);
    });
    it('should return the default value for null, undefined, or NaN', function () {
        assert.strictEqual(make_float(null, SP), SP);
        assert.strictEqual(make_float(undefined, SP), SP);
        assert.strictEqual(make_float(NaN, SP), SP);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'null':
                case 'undefined':
                case 'NaN':
                    assert.strictEqual(make_float(item.value, SP), SP);
                    break;
                case "''":
                case 'false':
                case '0':
                case '-0':
                case '0n':
                    assert.strictEqual(make_float(item.value, SP), 0);
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
                    assert.strictEqual(make_float(item.value, SP), item.value);
                    break;
                case '10n**100n':
                    assert.strictEqual(make_float(item.value, SP), 1e100);
                    break;
                case '-(10n**100n)':
                    assert.strictEqual(make_float(item.value, SP), -1e100);
                    break;
                case 'true':
                    assert.strictEqual(make_float(item.value, SP), 1);
                    break;
                case 'Infinity':
                case 'Number.POSITIVE_INFINITY':
                    assert.strictEqual(make_float(item.value, SP), Number.MAX_VALUE);
                    break;
                case '-Infinity':
                case 'Number.NEGATIVE_INFINITY':
                    assert.strictEqual(make_float(item.value, SP), -Number.MAX_VALUE);
                    break;
                default:
                    assert.strictEqual(make_float(item.value, SP), SP);
                    break;
                }
            });
        });
    });
});
