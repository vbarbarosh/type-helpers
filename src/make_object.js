function make_object(value, default_value = {})
{
    return (value !== null && typeof value === 'object') ? value : default_value;
}

export default make_object;
