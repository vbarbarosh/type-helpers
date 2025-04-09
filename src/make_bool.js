function make_bool(input, empty_value = false)
{
    if (input === null || input === undefined || Number.isNaN(input)) {
        return empty_value;
    }
    return !!input;
}

module.exports = make_bool;
