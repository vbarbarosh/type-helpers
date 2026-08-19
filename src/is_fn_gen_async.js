function is_fn_gen_async(input)
{
    if (typeof input !== 'function') {
        return false;
    }
    return Object.getPrototypeOf(input) === Object.getPrototypeOf(x);
}

/* node:coverage ignore next 3 */
async function* x()
{
}

module.exports = is_fn_gen_async;
