/**
 * The main use case was to convert a value into something, which could be used with dot expression:
 *
 *     safe_obj(val).xxx
 *
 * 🔦 Modern JavaScript have the optional chaining (?.) operator:
 *
 *     val?.xxx
 */
function safe_obj(input, empty_value = {})
{
    if (input === null || typeof input !== 'object') {
        return empty_value;
    }
    return input;
}

module.exports = safe_obj;
