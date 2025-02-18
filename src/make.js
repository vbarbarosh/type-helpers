const is_array = require('./is_array');
const is_function = require('./is_function');
const is_string = require('./is_string');
const make_bool = require('./make_bool');
const make_float = require('./make_float');
const make_int = require('./make_int');
const make_obj = require('./make_obj');
const make_str = require('./make_str');

const standard_types = {
    // {type: 'raw'}
    raw: function (value) {
        return value;
    },
    // {type: 'any', default: undefined}
    any: function (value, expr) {
        return value === undefined ? expr.default : value;
    },
    // {type: 'null'}
    null: function () {
        return null;
    },
    // {type: 'const', value: 123}
    const: function (value, expr) {
        return expr.value;
    },
    // {type: 'bool', default: false}
    bool: function (value, expr) {
        return make_bool(value, expr.default);
    },
    // {type: 'int', min: 0, max: 100, default: 0}
    int: function (value, expr) {
        const min = make_int(expr.min, Number.MIN_SAFE_INTEGER);
        const max = make_int(expr.max, Number.MAX_SAFE_INTEGER);
        const default_value = Math.min(max, Math.max(min, make_int(expr.default)));
        return make_int(value, default_value, min, max);
    },
    // {type: 'float', min: 0, max: 100, default: 0}
    float: function (value, expr) {
        const min = make_float(expr.min, -Number.MAX_VALUE);
        const max = make_float(expr.max, Number.MAX_VALUE);
        const default_value = Math.min(max, Math.max(min, make_float(expr.default)));
        return make_float(value, default_value, min, max);
    },
    // {type: 'string', default: 'foo'}
    string: function (value, expr) {
        return make_str(value, expr.default);
    },
    // {type: 'array', of: __type__, min: 0}
    array: function (value, expr, types) {
        const conf = make({
            of: {type: 'any', default: 'raw'},
            min: {type: 'int', min: 0}
        }, expr, types);
        let out;
        if (is_array(value)) {
            out = value.map(v => make(conf.of, v, types));
        }
        else if (conf.min > 0) {
            out = [make(conf.of, value, types)];
        }
        else {
            out = [];
        }
        while (out.length < conf.min) {
            out.push(make(conf.of, null, types));
        }
        return out;
    },
    // {type: 'tuple', items: []}
    tuple: function (value, expr, types) {
        if (!is_array(expr.items) || expr.items.length === 0) {
            throw new Error('[type=tuple] should have at least one option');
        }
        const values = is_array(value) ? value : [];
        return expr.items.map((v,i) => make(v, values[i], types));
    },
    // {type: 'enum', options: [], transform: v => v}
    enum: function (value, expr) {
        if (!is_array(expr.options) || expr.options.length === 0) {
            throw new Error('[type=enum] should have at least one option');
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
    },
    // {type: 'object', props: {...}, transform: v => v, finish: v => v}
    object: function (value, expr, types) {
        // {type: 'object', transform: ..., finish: ..., props: {...}}
        // adjust, complete, finish, realize, apply_limits, balance
        const value_obj = (expr.transform ? expr.transform(value) : make_obj(value));
        return Object.fromEntries(Object.entries(expr.props||{}).map(function ([k, v]) {
            if (v.optional && value_obj[k] === undefined) {
                return null;
            }
            return [k, make(v, value_obj[k], types)];
        }).filter(v => v));
    },
    // {type: 'union', prop: 'kind', options: {...}
    union: function (value, expr, types) {
        // https://zod.dev/?id=discriminated-unions
        // Here is a construction for objects. This thing called "Discriminated unions" in zod language
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
    },
};

/**
 * Make values from spec. Kind of class/type factory.
 */
function make(expr, value, types)
{
    if (!expr) {
        throw new Error('Empty expressions are not allowed');
    }

    if (is_string(expr)) {
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
    if (is_array(expr.type)) {
        return make({type: 'object', props: {...expr, type: expr.type[0]}}, value, types);
    }

    // Standard types
    if (standard_types[expr.type]) {
        return standard_types[expr.type](value, expr, types);
    }

    // Custom types
    if (types[expr.type]) {
        if (is_function(types[expr.type])) {
            return types[expr.type](value, expr, types);
        }
        if (is_array(types[expr.type])) {
            throw new Error('Type defined as array.');
        }
        if ('type' in types[expr.type]) {
            // ✳️ type aliases (custom types expressed as another custom types — topmost properties should have priority)
            // const types = {
            //     int_0_100: {type: 'int', min: 0, max: 100, default: 1},
            //     // The intention here - is to reuse type int_0_100 the way it was configured, just set max to 10.
            //     int_0_10: {type: 'int_0_100', max: 10},
            // }
            return make({...types[expr.type], ...expr, type: types[expr.type].type}, value, types);
        }
        // Custom type defined without [type] property is a set of props for [object]
        return make(types[expr.type], value, types);
    }

    throw new Error(`Invalid type: ${expr.type}`);
}

module.exports = make;
