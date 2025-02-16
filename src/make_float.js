const is_array = require('./is_array');

function make_float(value, default_value = 0, min = -Number.MAX_VALUE, max = Number.MAX_VALUE)
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

    const tmp = value*1;
    if (Number.isNaN(tmp)) {
        return default_value;
    }

    // ||0 to convert -0 to 0
    return Math.max(min, Math.min(max, tmp||0));
}

module.exports = make_float;
