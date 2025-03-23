function is_number(input)
{
    return (typeof input === 'number') && isFinite(input);
}

module.exports = is_number;
