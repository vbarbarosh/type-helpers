function is_object(input)
{
    return (input !== null && typeof input === 'object' && !Array.isArray(input));
}

module.exports = is_object;
