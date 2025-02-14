function make_float(value, default_value = 0, min = -Number.MAX_VALUE, max = Number.MAX_VALUE)
{
    if (value === null || value === undefined || isNaN(value)) {
        return default_value;
    }
    return Math.max(min, Math.min(max, +value||0));
}

module.exports = make_float;
