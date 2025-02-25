const is_number = require('./is_number');

function is_number_gt(value, min)
{
    return is_number(value) && value > min;
}

module.exports = is_number_gt;
