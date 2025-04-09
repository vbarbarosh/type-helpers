function is_fn_gen_async(input)
{
    if (input === null || input === undefined) {
        return false;
    }
    return Object.getPrototypeOf(input) === Object.getPrototypeOf(x);
}

/* istanbul ignore next */
async function* x()
{
}

module.exports = is_fn_gen_async;
