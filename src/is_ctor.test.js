const assert = require('assert');
const is_ctor = require('./is_ctor');

describe('is_ctor', function () {
    it('true', function () {
        assert.strictEqual(is_ctor(class Banner {}), true);
        assert.strictEqual(is_ctor(class Banner { constructor() {} }), true);
        assert.strictEqual(is_ctor(function Banner() {}), true);
        assert.strictEqual(is_ctor(function () {}), true);
        assert.strictEqual(is_ctor(Array), true);
        assert.strictEqual(is_ctor(Function), true);
        assert.strictEqual(is_ctor(new Function), true);

        assert.strictEqual(typeof class Banner {}, 'function');
        assert.strictEqual(typeof class Banner { constructor() {} }, 'function');
        assert.strictEqual(typeof function Banner() {}, 'function');
        assert.strictEqual(typeof function () {}, 'function');
        assert.strictEqual(typeof Array, 'function');
        assert.strictEqual(typeof Function, 'function');
        assert.strictEqual(typeof new Function, 'function');
    });
    it('false', function () {
        assert.strictEqual(is_ctor(() => 0), false);

        assert.strictEqual(typeof (() => 0), 'function');
    });
});
