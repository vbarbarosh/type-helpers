const edge_values = require('./edge_values');
const is_ctor = require('./is_ctor');
const is_fn = require('./is_fn');
const is_gen = require('./is_gen');
const is_gen_async = require('./is_gen_async');

describe('edge_values', function () {
    describe('mute nyc about uncalled functions', function () {
        edge_values.forEach(function (item) {
            if (is_ctor(item.value)) {
                it(item.label, async function () {
                    new item.value();
                });
            }
            else if (is_gen(item.value)) {
                it(item.label, async function () {
                    Array.from(item.value());
                });
            }
            else if (is_gen_async(item.value)) {
                it(item.label, async function () {
                    // TypeError: Array.fromAsync is not a function
                    // Node.js: 22+
                    // await Array.fromAsync(item.value());
                    for await (const tmp of item.value()) {
                        // ignore
                    }
                });
            }
            else if (is_fn(item.value)) {
                it(item.label, async function () {
                    await item.value();
                });
            }
        });
    });
});
