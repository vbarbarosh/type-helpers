function is_async_generator(value)
{
    if (value === null || value === undefined) {
        return false;
    }
    return Object.getPrototypeOf(value) === Object.getPrototypeOf(x);
}

async function* x()
{
}

module.exports = is_async_generator;
