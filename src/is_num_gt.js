const is_num = require('./is_num');

function is_num_gt(input, min)
{
    return is_num(input) && input > min;
}

module.exports = is_num_gt;
