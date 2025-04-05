function is_obj(input)
{
    return (input !== null && typeof input === 'object' && !Array.isArray(input));
}

module.exports = is_obj;
