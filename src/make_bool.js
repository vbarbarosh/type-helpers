function make_bool(value, default_value = false)
{
    if (typeof value !== 'boolean') {
        return default_value;
    }
    return value;
}

export default make_bool;
