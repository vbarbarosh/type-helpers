function make_string(value, default_value = '')
{
    if (typeof value !== 'string') {
        return default_value;
    }
    return String(value);
}

export default make_string;
