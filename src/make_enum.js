function make_enum(input, options, empty_value = options[0])
{
    if (options.includes(input)) {
        return input;
    }
    return empty_value;
}

module.exports = make_enum;
