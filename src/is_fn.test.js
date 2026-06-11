const assert = require('assert');
const edge_values = require('./edge_values');
const is_fn = require('./is_fn');

describe('is_fn', function () {
    it('should accept no args', function () {
        assert.strictEqual(is_fn(), false);
    });
    describe('should handle edge values', function () {
        edge_values.forEach(function (item) {
            it(item.label, function () {
                switch (item.label) {
                case 'function':
                case 'function*':
                case 'async function':
                case 'async function*':
                case 'class Foo {}':
                case 'class Foo { constructor() {} }':
                case '() => 1':
                case 'async () => 1':
                case 'Symbol':
                    assert.strictEqual(is_fn(item.value), true);
                    break;
                default:
                    assert.strictEqual(is_fn(item.value), false);
                    break;
                }
            });
        });
    });
});
