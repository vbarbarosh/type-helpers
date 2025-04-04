const is_array = require('./is_array');

// Returning default_value as is will allow the following:
//     make_int(v.width, null, 0, 4096)
//
function make_int(input, default_value = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER)
{
    if (input === null || input === undefined || is_array(input) || Number.isNaN(input)) {
        return default_value;
    }

    switch (typeof input) {
    case 'bigint':
        return Math.max(min, Math.min(max, Number(input)));
    case 'symbol':
    case 'function':
        return default_value;
    }

    const tmp = Math.trunc(input*1);
    if (Number.isNaN(tmp)) {
        return default_value;
    }

    // ||0 to convert -0 to 0
    return Math.max(min, Math.min(max, tmp||0));
}

module.exports = make_int;
