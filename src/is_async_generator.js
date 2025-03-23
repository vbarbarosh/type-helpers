function is_async_generator(input)
{
    if (input === null || input === undefined) {
        return false;
    }
    return Object.getPrototypeOf(input) === Object.getPrototypeOf(x);
}

async function* x()
{
}

module.exports = is_async_generator;
