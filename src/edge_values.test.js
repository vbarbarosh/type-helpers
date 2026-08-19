const assert = require('assert');
const edge_values = require('./edge_values');
const {describe, it} = require('node:test');

describe('edge_values', function () {
    // Sweeps switch on labels; a reused label would silently inherit another
    // value's expectations instead of being confronted by the default branch.
    it('every item is {label, value}, with a unique non-empty string label', function () {
        const labels = edge_values.map(v => v.label);
        assert.deepStrictEqual(labels.filter(v => typeof v === 'string' && v.length > 0), labels);
        assert.strictEqual(new Set(labels).size, labels.length);
        edge_values.forEach(function (item) {
            assert.strictEqual(Object.hasOwn(item, 'value'), true, item.label);
        });
    });
});
