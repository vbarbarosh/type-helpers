const is_array = require('./is_array');

// Returning default_value as is will allow the following:
//     make_int(v.width, null, 0, 4096)
//
function make_int(value, default_value = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER)
{
    if (value === null || value === undefined || is_array(value) || Number.isNaN(value)) {
        return default_value;
    }

    switch (typeof value) {
    case 'bigint':
        return Math.max(min, Math.min(max, Number(value)));
    case 'symbol':
    case 'function':
        return default_value;
    }

    const tmp = Math.trunc(value*1);
    if (Number.isNaN(tmp)) {
        return default_value;
    }

    // ||0 to convert -0 to 0
    return Math.max(min, Math.min(max, tmp||0));
}

module.exports = make_int;
