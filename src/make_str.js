function make_str(value, default_value = '')
{
    // if (value === null || value === undefined || value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY || Number.isNaN(value)) {
    //     return default_value;
    // }
    if (typeof value !== 'string') {
        return default_value;
    }
    return value;
}

module.exports = make_str;
