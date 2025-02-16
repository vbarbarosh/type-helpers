/**
 * The main use case was to convert a value into something, which could be used with dot expression:
 *
 *     make_obj(val).xxx
 *
 * 🔦 Modern JavaScript have a better alternative:
 *
 *     val?.xxx
 */
function make_obj(value, default_value = {})
{
    if (value === null || typeof value !== 'object') {
        return default_value;
    }
    return value;
}

module.exports = make_obj;
