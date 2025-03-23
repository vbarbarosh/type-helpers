function make_bool(input, default_value = false)
{
    if (input === null || input === undefined || Number.isNaN(input)) {
        return default_value;
    }
    return !!input;
}

module.exports = make_bool;
