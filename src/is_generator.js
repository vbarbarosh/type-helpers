function is_generator(input)
{
    if (typeof input === 'function') {
        return input.constructor === x.constructor;
    }
    return false;
}

function* x()
{
}

module.exports = is_generator;
