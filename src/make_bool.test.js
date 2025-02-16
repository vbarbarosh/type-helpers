const assert = require('assert');
const edge_values = require('./edge_values');
const make_bool = require('./make_bool');

const SP = Symbol('default_value for make_bool');

describe('make_bool', function () {
    it('should accept no args', function () {
        assert.strictEqual(make_bool(), false);
    });
    it('should return the default value for null, undefined, or NaN', function () {
        assert.strictEqual(make_bool(null, SP), SP);
        assert.strictEqual(make_bool(undefined, SP), SP);
        assert.strictEqual(make_bool(NaN, SP), SP);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'null':
                case 'undefined':
                case 'NaN':
                    assert.strictEqual(make_bool(item.value, SP), SP);
                    break;
                default:
                    assert.strictEqual(make_bool(item.value, SP), !!item.value);
                    break;
                }
            });
        });
    });
});
