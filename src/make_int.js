// Returning default_value as is will allow the following:
//     make_int(v.width, null, 0, 4096)
//
function make_int(value, default_value = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER)
{
    switch (typeof value) {
    case 'bigint':
        return Math.max(min, Math.min(max, Number(value)));
    case 'symbol':
        return default_value;
    }
    if (value === null || value === undefined || !isFinite(value)) {
        return default_value;
    }
    return Math.max(min, Math.min(max, Math.trunc(value === 0 ? value : (+value||default_value))));
}

module.exports = make_int;
