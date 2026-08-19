function is_fn_gen(input)
{
    if (typeof input !== 'function') {
        return false;
    }
    return Object.getPrototypeOf(input) === Object.getPrototypeOf(x);
}

/* node:coverage ignore next 3 */
function* x()
{
}

module.exports = is_fn_gen;
