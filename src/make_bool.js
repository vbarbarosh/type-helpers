function make_bool(value, default_value = false)
{
    if (value === null || value === undefined) {
        return default_value;
    }
    return !!value;
}

module.exports = make_bool;
