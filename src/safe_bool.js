function safe_bool(input, empty_value = false)
{
    if (input === null || input === undefined || Number.isNaN(input)) {
        return empty_value;
    }
    return !!input;
}

module.exports = safe_bool;
