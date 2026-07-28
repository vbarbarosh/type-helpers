function is_int_gt(input, min)
{
    return Number.isInteger(input) && input > min;
}

module.exports = is_int_gt;
