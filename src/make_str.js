function make_str(value, default_value = '')
{
    // if (value === null || value === undefined || value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY || Number.isNaN(value)) {
    //     return default_value;
    // }
    switch (typeof value) {
    case 'string':
        return value;
    case 'bigint':
        return value.toString();
    case 'number':
        if (Object.is(value, -0)) {
            return '0';
        }
        if (Number.isFinite(value)) {
            return value.toString();
        }
        // fall through
    default:
        return default_value;
    }
}

module.exports = make_str;
