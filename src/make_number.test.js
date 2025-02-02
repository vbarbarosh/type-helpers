const assert = require('assert');
const make_number = require('./make_number');

const items = [
    ['null → 0', null, 0],
    ['undefined → 0', undefined, 0],
    ['{} → 0', {}, 0],
    ['nan → 0', NaN, 0],
    ['-inf → 0', -Infinity, 0],
    ['+inf → 0', +Infinity, 0],
    ['false → 0', false, 0],
    ['true → 1', true, 1],
    ['Symbol() → 0', Symbol(), 0],
    ['Function → 0', () => 1, 0],
    ['BigInt(1) → 1', 1n, 1],
    ['"123" → 123', '123', 123],
];

describe('make_number', function () {
    items.forEach(function ([title, input, expected]) {
        it(title, function () {
            assert.deepStrictEqual(make_number(input), expected);
        });
    });
});
