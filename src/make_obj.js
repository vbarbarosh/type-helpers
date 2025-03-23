/**
 * The main use case was to convert a value into something, which could be used with dot expression:
 *
 *     make_obj(val).xxx
 *
 * 🔦 Modern JavaScript have a better alternative:
 *
 *     val?.xxx
 */
function make_obj(input, default_value = {})
{
    if (input === null || typeof input !== 'object') {
        return default_value;
    }
    return input;
}

module.exports = make_obj;
