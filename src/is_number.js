function is_number(value)
{
    return (typeof value === 'number') && isFinite(value);
}

module.exports = is_number;
