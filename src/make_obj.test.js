const assert = require('assert');
const edge_values = require('./edge_values');
const make_obj = require('./make_obj');

const SP = Symbol('empty_value for make_obj');

describe('make_obj', function () {
    it('should accept no args', function () {
        assert.deepStrictEqual(make_obj(), {});
    });
    it('should return the default value for null, undefined, or NaN', function () {
        assert.strictEqual(make_obj(null, SP), SP);
        assert.strictEqual(make_obj(undefined, SP), SP);
        assert.strictEqual(make_obj(NaN, SP), SP);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case '/./':
                case '{}':
                case '[]':
                    assert.strictEqual(make_obj(item.value, SP), item.value);
                    break;
                default:
                    assert.strictEqual(make_obj(item.value, SP), SP);
                    break;
                }
            });
        });
    });
});
