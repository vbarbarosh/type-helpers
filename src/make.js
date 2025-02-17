const make_bool = require('./make_bool');
const make_float = require('./make_float');
const make_int = require('./make_int');
const make_obj = require('./make_obj');
const make_str = require('./make_str');

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
    case 'union':
        // https://zod.dev/?id=discriminated-unions
        // Here is a construction for objects. This thing called "Discriminated unions" in zod language
        {
            // [options] could be replaced by [match] as in PHP or Rust
            const prop = expr.prop ?? 'type';
            let type = value?.[prop];
            let expr2 = expr.options?.[type];
            if (!expr2) {
                type = expr.default;
                expr2 = expr.options?.[type];
            }
            if (!expr2) {
                throw new Error(`Union type option not found: [${prop} / ${expr.default}]`);
            }
            const out = {};
            out[expr.prop || 'type'] = type;
            return Object.assign(out, make(expr2, value, types));
        }
    case 'null':
        return null;
    case 'any':
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
            // {type: 'object', transform: ..., finish: ..., props: {...}}
            // adjust, complete, finish, realize, apply_limits, balance
            const value_obj = (expr.transform ? expr.transform(value) : make_obj(value));
            return Object.fromEntries(Object.entries(expr.props||{}).map(function ([k, v]) {
                if (v.optional && value_obj[k] === undefined) {
                    return null;
                }
                return [k, make(v, value_obj[k], types)];
            }).filter(v => v));
        }
    // enum: one of strings
    // enum-list: any of strings
    // enum-map1: one of strings as map [all false, only one true]
    // enum-map: any of strings as map [any number of true]
    case 'enum':
        {
            if (!Array.isArray(expr.options) || expr.options.length === 0) {
                throw new Error('enum types should have at least one option');
            }
            let tmp = value;
            if (expr.transform) {
                switch (typeof expr.transform) {
                case 'object':
                    if (value in expr.transform) {
                        tmp = expr.transform[value];
                    }
                    break;
                case 'function':
                    tmp = expr.transform(value, expr);
                    break;
                }
            }
            if (expr.options.includes(tmp)) {
                return tmp;
            }
            if ('default' in expr) {
                return expr.default;
            }
            return expr.options[0];
        }
    // // an array of unique strings
    // case 'tags':
    // // an object with [key,bool] where each key could be [true] or [false]
    // case 'tags-map':
    case 'int':
        {
            const min = expr.min ?? Number.MIN_SAFE_INTEGER;
            const max = expr.max ?? Number.MAX_SAFE_INTEGER;
            const default_value = Math.min(max, Math.max(min, expr.default ?? 0));
            return make_int(value, default_value, min, max)
        }
    case 'float':
        return make_float(value, expr.default ?? 0, expr.min ?? -Number.MAX_VALUE, expr.max ?? Number.MAX_VALUE);
    case 'string':
        return make_str(value, expr.default ?? '');
    case 'bool':
        return make_bool(value, expr.default ?? false);
    case 'array':
        {
            const min = expr.min || 0;
            const out = [];
            if (Array.isArray(value)) {
                out.push(...value.map(v => make(expr.of, v, types)));
            }
            while (out.length < min) {
                out.push(make(expr.of, value, types));
            }
            return out;
        }
    default:
        if (typeof types[expr.type] === 'function') {
            return types[expr.type](value, expr, types);
        }
        if (Array.isArray(types[expr.type])) {
            throw new Error('Type defined as array.');
        }
        if (types[expr.type]) {
            // if (typeof types[expr.type] === 'string' || types[expr.type].type) {
            //     return make(types[expr.type], value, types);
            // }
            // if (types[expr.type]) {
            //     const out = {type: expr.type};
            //     const tmp = value || {};
            //     Object.entries(types[expr.type]).forEach(function ([k,v]) {
            //         out[k] = make(v, tmp[k], types);
            //     });
            //     return out;
            // }
            return make(types[expr.type], value, types);
        }
    }

    throw new Error(`Invalid type: ${expr.type}`);
}

module.exports = make;
