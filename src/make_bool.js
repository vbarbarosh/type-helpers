function make_bool(value, default_value = false)
{
    if (value === null || value === undefined || Number.isNaN(value)) {
        return default_value;
    }
    return !!value;
}

module.exports = make_bool;
