const is_array = require('./is_array');

function is_empty(value)
{
    if (value === null || value === undefined) {
        return true;
    }
    switch (typeof value) {
    case 'object':
        if (is_array(value)) {
            return value.length === 0;
        }
        return Object.keys(value).length === 0;
    default:
        return !value;
    }
}

module.exports = is_empty;
