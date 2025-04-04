function make_str(input, default_value = '')
{
    // if (value === null || value === undefined || value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY || Number.isNaN(value)) {
    //     return default_value;
    // }
    switch (typeof input) {
    case 'string':
        return input;
    case 'boolean':
        return input.toString();
    case 'bigint':
        // ⚠️ Should I add `n` to the end?
        return input.toString();
    case 'number':
        if (Object.is(input, -0)) {
            return '0';
        }
        if (Number.isFinite(input)) {
            return input.toString();
        }
        // fall through
    default:
        return default_value;
    }
}

module.exports = make_str;
