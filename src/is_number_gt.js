const is_number = require('./is_number');

function is_number_gt(input, min)
{
    return is_number(input) && input > min;
}

module.exports = is_number_gt;
