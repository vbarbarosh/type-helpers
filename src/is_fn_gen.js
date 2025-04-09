function is_fn_gen(input)
{
    if (typeof input === 'function') {
        return input.constructor === x.constructor;
    }
    return false;
}

/* istanbul ignore next */
function* x()
{
}

module.exports = is_fn_gen;
