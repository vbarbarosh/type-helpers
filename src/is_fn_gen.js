function is_fn_gen(input)
{
    if (typeof input !== 'function') {
        return false;
    }
    return Object.getPrototypeOf(input) === Object.getPrototypeOf(x);
}

/* istanbul ignore next */
function* x()
{
}

module.exports = is_fn_gen;
