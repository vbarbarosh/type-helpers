function make_enum(value, options, default_value = options[0])
{
    if (options.includes(value)) {
        return value;
    }
    return default_value;
}

module.exports = make_enum;
