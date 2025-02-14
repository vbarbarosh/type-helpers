const make_bool = require('./make_bool');
const make_float = require('./make_float');
const make_int = require('./make_int');
const make_str = require('./make_str');
const make_obj = require('./make_obj');

/**
 * Make values from spec. Kind of class/type factory.
 */
function make(expr, value, types)
{
    if (!expr) {
        throw new Error('Empty expressions are not allowed');
    }

    if (typeof expr === 'string') {
        return make({type: expr}, value, types);
    }

    // 🤯 {type: 'array', of: 'int', min: 5, nullable: true}
    if (expr.nullable && (value === null || value === undefined)) {
        return null;
    }

    // 🩼 When `expr` is an object, it is the same as `{type: 'object', props: ...}`, unless it has `type` property.
    if (!('type' in expr)) {
        return make({type: 'object', props: expr}, value, types);
    }
    // 🩼 A way to remove special meaning from `type` property is to wrap its value into array
    if (Array.isArray(expr.type)) {
        return make({type: 'object', props: {...expr, type: expr.type[0]}}, value, types);
    }

    switch (expr.type) {
    case 'dynamic':
        {
            const prop = expr.prop ?? 'type';
            let type = value?.[prop];
            let expr2 = expr.options?.[type];
            if (!expr2) {
                type = expr.default;
                expr2 = expr.options?.[type];;
            }
            if (!expr2) {
                throw new Error(`Dynamic type option not found: [${prop} / ${expr.default}]`);
            }
            const out = {};
            out[expr.prop || 'type'] = type;
            return Object.assign(out, make(expr2, value, types));
        }
    case 'null':
        return null;
    case 'raw':
        return value;
    case 'const':
        return expr.value;
    case 'fn':
        return expr.fn(value, expr, types);
    case 'anon':
        return Object.fromEntries(Object.keys(types).map(key => [key, make({type: key}, value?.[key], types)]));
    case 'object':
        {
            const value_obj = make_obj(value);
            return Object.fromEntries(Object.entries(expr.props||{}).map(function ([k, v]) {
                return [k, make(v, value_obj[k], types)];
            }));
        }
    case 'enum':
        if (!Array.isArray(expr.options) || expr.options.length === 0) {
            throw new Error('enum types should have at least one option');
        }
        if (expr.options.includes(value)) {
            return value;
        }
        if ('default' in expr) {
            return expr.default;
        }
        return expr.options[0];
    case 'int':
        return make_int(value, expr.default ?? 0, expr.min ?? Number.MIN_SAFE_INTEGER, expr.max ?? Number.MAX_SAFE_INTEGER);
    case 'float':
        return make_float(value, expr.default ?? 0, expr.min ?? -Number.MAX_VALUE, expr.max ?? Number.MAX_VALUE);
    case 'string':
        return make_str(value, expr.default ?? '');
    case 'bool':
        return make_bool(value, expr.default ?? false);
    case 'array':
        if (Array.isArray(value)) {
            return array_pad(value.map(v => make(expr.of, v, types)), expr.min ?? 0, make(expr.of, null, types));
        }
        if (!expr.min) {
            return [];
        }
        return array_pad([], expr.min ?? 0, make(expr.of, value, types));
    default:
        if (typeof types[expr.type] === 'function') {
            return types[expr.type](value);
        }
        if (Array.isArray(types[expr.type])) {
            throw new Error('Type defined as array.');
        }
        if (types[expr.type]) {
            if (typeof types[expr.type] === 'string' || types[expr.type].type) {
                return make(types[expr.type], value, types);
            }
            if (types[expr.type]) {
                const out = {type: expr.type};
                const tmp = value || {};
                Object.entries(types[expr.type]).forEach(function ([k,v]) {
                    out[k] = make(v, tmp[k], types);
                });
                return out;
            }
        }
    }

    throw new Error(`Invalid type: ${expr.type}`);
}

function array_pad(array, len, value)
{
    array.push(...Array(Math.max(0, len - array.length)).fill(value));
    return array;
}

module.exports = make;
