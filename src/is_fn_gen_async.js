function is_fn_gen_async(input)
{
    if (typeof input !== 'function') {
        return false;
    }
    return Object.getPrototypeOf(input) === Object.getPrototypeOf(x);
}

/* istanbul ignore next */
async function* x()
{
}

module.exports = is_fn_gen_async;
