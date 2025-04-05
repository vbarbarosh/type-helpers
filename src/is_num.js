function is_num(input)
{
    return (typeof input === 'number') && isFinite(input);
}

module.exports = is_num;
