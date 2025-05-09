const is_array = require('./is_array');

// Returning empty_value as is will allow the following:
//     safe_int(v.width, null, 0, 4096)
//
function safe_int(input, empty_value = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER)
{
    if (input === null || input === undefined || Number.isNaN(input)) {
        return empty_value;
    }

    switch (typeof input) {
    case 'bigint':
        return Math.max(min, Math.min(max, Number(input)));
    case 'object':
    case 'symbol':
    case 'function':
        return empty_value;
    }

    const tmp = Math.trunc(input*1);
    if (Number.isNaN(tmp)) {
        return empty_value;
    }

    // ||0 to convert -0 to 0
    return Math.max(min, Math.min(max, tmp||0));
}

module.exports = safe_int;
