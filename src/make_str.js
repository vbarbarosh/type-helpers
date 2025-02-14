function make_str(value, default_value = '')
{
    if (typeof value !== 'string') {
        return default_value;
    }
    return String(value);
}

module.exports = make_str;
