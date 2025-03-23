const is_array = require('./is_array');

function is_empty(input)
{
    if (input === null || input === undefined) {
        return true;
    }
    switch (typeof input) {
    case 'object':
        if (is_array(input)) {
            return input.length === 0;
        }
        return Object.keys(input).length === 0;
    default:
        return !input;
    }
}

module.exports = is_empty;
