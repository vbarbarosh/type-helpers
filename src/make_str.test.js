const assert = require('assert');
const edge_values = require('./edge_values');
const make_str = require('./make_str');

const SP = Symbol('default_value for make_str');

describe('make_str', function () {
    it('should accept no args', function () {
        assert.strictEqual(make_str(), '');
    });
    it('should return the default value for null, undefined, or NaN', function () {
        assert.strictEqual(make_str(null, SP), SP);
        assert.strictEqual(make_str(undefined, SP), SP);
        assert.strictEqual(make_str(NaN, SP), SP);
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
                    assert.strictEqual(make_str(item.value, SP), item.value);
                    break;
                default:
                    assert.strictEqual(make_str(item.value, SP), SP);
                    break;
                }
            });
        });
    });
});
