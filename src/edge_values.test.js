const edge_values = require('./edge_values');
const is_async_generator = require('./is_async_generator');
const is_ctor = require('./is_ctor');
const is_function = require('./is_function');
const is_generator = require('./is_generator');

describe('edge_values', function () {
    describe('mute nyc about uncalled functions', function () {
        edge_values.forEach(function (item) {
            if (is_ctor(item.value)) {
                it(item.label, async function () {
                    new item.value();
                });
            }
            else if (is_async_generator(item.value)) {
                it(item.label, async function () {
                    await Array.fromAsync(item.value());
                });
            }
            else if (is_generator(item.value)) {
                it(item.label, async function () {
                    Array.from(item.value());
                });
            }
            else if (is_function(item.value)) {
                it(item.label, async function () {
                    await item.value();
                });
            }
        });
    });
});
