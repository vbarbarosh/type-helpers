const is_array = require('./is_array');
const is_fn = require('./is_fn');
const is_str = require('./is_str');
const safe_bool = require('./safe_bool');
const safe_float = require('./safe_float');
const safe_int = require('./safe_int');
const safe_obj = require('./safe_obj');
const safe_str = require('./safe_str');

const standard_types = {
    // {type: 'raw', nullable: false, before: input => input, after: out => out}
    raw: function (input) {
        return input;
    },
    // {type: 'any', default: undefined, nullable: false, before: input => input, after: out => out}
    any: function (input, params) {
        return input === undefined ? params.default : input;
    },
    // {type: 'null', nullable: false, before: input => input, after: out => out}
    // A shorthand for {type: 'const', value: null}
    null: function () {
        return null;
    },
    // {type: 'const', value: 123, nullable: false, before: input => input, after: out => out}
    const: function (input, params) {
        return params.value;
    },
    // {type: 'bool', default: false, nullable: false, before: input => input, after: out => out}
    bool: function (input, params) {
        return safe_bool(input, null) ?? safe_bool(params.default);
    },
    // {type: 'int', min: 0, max: 100, default: 0, nullable: false, before: input => input, after: out => out}
    int: function (input, params) {
        const min = safe_int(params.min, Number.MIN_SAFE_INTEGER);
        const max = safe_int(params.max, Number.MAX_SAFE_INTEGER);
        return safe_int(input, null, min, max) ?? Math.min(max, Math.max(min, safe_int(params.default)));
    },
    // {type: 'float', min: 0, max: 100, default: 0, nullable: false, before: input => input, after: out => out}
    float: function (input, params) {
        const min = safe_float(params.min, -Number.MAX_VALUE);
        const max = safe_float(params.max, Number.MAX_VALUE);
        const default_value = Math.min(max, Math.max(min, safe_float(params.default)));
        return safe_float(input, default_value, min, max);
    },
    // {type: 'str', default: 'foo', nullable: false, before: input => input, after: out => out}
    str: function (input, params) {
        return safe_str(input, null) ?? safe_str(params.default);
    },
    // {type: 'enum', options: [], transform: v => v, nullable: false, before: input => input, after: out => out}
    enum: function (input, params) {
        if (!is_array(params.options) || params.options.length === 0) {
            throw new Error('[type=enum] should have at least one option');
        }
        let tmp = input;
        if (params.transform) {
            switch (typeof params.transform) {
            case 'object':
                if (input in params.transform) {
                    tmp = params.transform[input];
                }
                break;
            case 'function':
                tmp = params.transform(input, params);
                break;
            }
        }
        if (params.options.includes(tmp)) {
            return tmp;
        }
        if ('default' in params) {
            return params.default;
        }
        return params.options[0];
    },
    // {type: 'array', of: __type__, min: 0, nullable: false, before: input => input, after: out => out}
    array: function (input, params, types) {
        const conf = make(params, {
            of: {type: 'any', default: 'raw'},
            min: {type: 'int', min: 0}
        }, types);
        let out;
        if (is_array(input)) {
            out = input.map(v => make(v, conf.of, types));
        }
        else if (conf.min > 0) {
            out = [make(input, conf.of, types)];
        }
        else {
            out = [];
        }
        while (out.length < conf.min) {
            out.push(make(null, conf.of, types));
        }
        return out;
    },
    // {type: 'tuple', items: [], nullable: false, before: input => input, after: out => out}
    tuple: function (input, params, types) {
        if (!is_array(params.items) || params.items.length === 0) {
            throw new Error('[type=tuple] should have at least one option');
        }
        const values = is_array(input) ? input : [];
        return params.items.map((v,i) => make(values[i], v, types));
    },
    // {type: 'tags', options: ['foo', 'bar', 'baz'], nullable: false, before: input => input, after: out => out}
    tags: function (input, params) {
        if (!is_array(params.options)) {
            throw new Error('[type=tags] should have options defined');
        }
        const all = new Set(params.options);
        const out = [];
        if (is_array(input)) {
            const taken = new Set();
            input.forEach(function (tmp) {
                if (all.has(tmp)) {
                    if (!taken.has(tmp)) {
                        taken.add(tmp);
                        out.push(tmp);
                    }
                }
            });
        }
        return out;
    },
    // {type: 'obj', props: {...}, transform: v => v, finish: v => v, nullable: false, before: input => input, after: out => out}
    obj: function (input, params, types) {
        // {type: 'obj', transform: ..., finish: ..., props: {...}}
        // adjust, complete, finish, realize, apply_limits, balance
        const value_obj = (params.transform ? params.transform(input) : safe_obj(input));
        return Object.fromEntries(Object.entries(params.props||{}).map(function ([k, v]) {
            if (v.optional && value_obj[k] === undefined) {
                return null;
            }
            return [k, make(value_obj[k], v, types)];
        }).filter(v => v));
    },
    // {type: 'union', prop: 'kind', options: {...}, nullable: false, before: input => input, after: out => out}
    union: function (input, params, types) {
        // https://zod.dev/?id=discriminated-unions
        // Here is a construction for objects. This thing called "Discriminated unions" in zod language
        // [options] could be replaced by [match] as in PHP or Rust
        const prop = params.prop ?? 'type';
        let type = input?.[prop];
        let expr2 = get_own(params.options, type);
        if (!expr2) {
            type = params.default;
            expr2 = get_own(params.options, type);
        }
        if (!expr2) {
            throw new Error(`Union type option not found: prop=${prop}, value=${input?.[prop]}, default=${params.default}`);
        }
        return {[prop]: type, ...make(input, expr2, types)};
    },
};

function get_own(input, key)
{
    return input && Object.hasOwn(input, key) ? input[key] : undefined;
}

/**
 * Make values from spec. Kind of class/type factory.
 */
function make(input, expr, types)
{
    if (!expr) {
        throw new Error('Empty expressions are not allowed');
    }

    if (is_str(expr) || is_fn(expr)) {
        return make(input, {type: expr}, types);
    }

    // 🤯 {type: 'array', of: 'int', min: 5, nullable: true}
    if (expr.nullable && (input === null || input === undefined)) {
        return null;
    }

    // 🩼 When `expr` is an object, it is the same as `{type: 'obj', props: ...}`, unless it has `type` property.
    if (!('type' in expr)) {
        return make(input, {type: 'obj', props: expr}, types);
    }
    // 🩼 A way to remove special meaning from `type` property is to wrap its value into array
    if (is_array(expr.type)) {
        return make(input, {type: 'obj', props: {...expr, type: expr.type[0]}}, types);
    }

    // Standard types
    const standard_type = get_own(standard_types, expr.type);
    if (standard_type) {
        return convert(input => standard_type(input, expr, types));
    }

    // Custom types

    if (is_fn(expr.type)) {
        return convert(input => expr.type(input, expr, types));
    }

    const custom_type = get_own(types, expr.type);
    if (custom_type) {
        if (is_fn(custom_type)) {
            return convert(input => custom_type(input, expr, types));
        }
        if (is_array(custom_type)) {
            // 💎 Could be a tuple
            throw new Error('Type defined as array');
        }
        if ('type' in custom_type) {
            // ✳️ type aliases (custom types expressed as another custom types — topmost properties should have priority)
            // const types = {
            //     int_0_100: {type: 'int', min: 0, max: 100, default: 1},
            //     // The intention here - is to reuse type int_0_100 the way it was configured, just set max to 10.
            //     int_0_10: {type: 'int_0_100', max: 10},
            // }
            return make(input, {...custom_type, ...expr, type: custom_type.type}, types);
        }
        // Custom type defined without [type] property is a set of props for [obj]
        return make(input, custom_type, types);
    }

    throw new Error(`Invalid type: ${expr.type}`);

    function convert(fn) {
        const input2 = before(input);
        if (expr.nullable && (input2 === null || input2 === undefined)) {
            return null;
        }
        return after(fn(input2));
    }
    function before(input) {
        if (is_fn(expr.before)) {
            return expr.before(input);
        }
        return input;
    }
    function after(out) {
        if (is_fn(expr.after)) {
            return expr.after(out);
        }
        return out;
    }
}

module.exports = make;
