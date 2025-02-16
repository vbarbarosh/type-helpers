/**
 * ⚠️ In short, there is no universal way to fid out whether a function is designed
 *    to be called as constructor or not. Anonymous functions [function () {}] could
 *    be designed expecting `new`.
 *
 * 💎 Only arrow functions are not constructors by design. Every other function - might
 *    work as a constructor.
 *
 * @link https://stackoverflow.com/a/40922715
 */
function is_ctor(value)
{
    try {
        Reflect.construct(String, [], value);
    }
    catch (error) {
        return false;
    }
    return true;
    // return !!(typeof value === 'function' && value.prototype && Object.getOwnPropertyNames(value.prototype).includes('constructor'));
}

module.exports = is_ctor;
