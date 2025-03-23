function make_enum(input, options, default_value = options[0])
{
    if (options.includes(input)) {
        return input;
    }
    return default_value;
}

module.exports = make_enum;
