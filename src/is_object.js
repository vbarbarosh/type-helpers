function is_object(value)
{
    return (value !== null && typeof value === 'object' && !Array.isArray(value));
}

module.exports = is_object;
