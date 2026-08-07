/**
 * ⚠️ In short, there is no universal way to find out whether a function is designed
 *    to be called as constructor or not. Anonymous functions [function () {}] could
 *    be designed expecting `new`.
 *
 * 💎 Only arrow functions are not constructors by design. Every other function - might
 *    work as a constructor.
 *
 * ⚠️ Symbol and BigInt pass IsConstructor (Reflect.construct accepts them as
 *    newTarget), yet `new Symbol()` and `new BigInt()` always throw — so both
 *    are excluded explicitly.
 *
 * @link https://stackoverflow.com/a/40922715
 */
function is_fn_ctor(input)
{
    if (input === Symbol || input === BigInt) {
        return false;
    }
    try {
        Reflect.construct(String, [], input);
    }
    catch (error) {
        return false;
    }
    return true;
    // return !!(typeof value === 'function' && value.prototype && Object.getOwnPropertyNames(value.prototype).includes('constructor'));
}

module.exports = is_fn_ctor;
