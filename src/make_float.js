const is_array = require('./is_array');

function make_float(input, empty_value = 0, min = -Number.MAX_VALUE, max = Number.MAX_VALUE)
{
    if (input === null || input === undefined || is_array(input) || Number.isNaN(input)) {
        return empty_value;
    }

    switch (typeof input) {
    case 'bigint':
        return Math.max(min, Math.min(max, Number(input)));
    case 'symbol':
    case 'function':
        return empty_value;
    }

    const tmp = input*1;
    if (Number.isNaN(tmp)) {
        return empty_value;
    }

    // ||0 to convert -0 to 0
    return Math.max(min, Math.min(max, tmp||0));
}

module.exports = make_float;
