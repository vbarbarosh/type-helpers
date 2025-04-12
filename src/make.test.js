const assert = require('assert');
const make = require('./make');
const safe_str = require('./safe_str');
const is_num = require('./is_num');

const SP = Symbol();

describe('make', function () {
    describe('expr', function () {
        it('should throw "Empty expressions are not allowed"', function () {
            assert.throws(() => make(), new Error('Empty expressions are not allowed'));
        });
        it('should throw "Type defined as array"', function () {
            assert.throws(() => make('', 'apple', {apple: []}), new Error('Type defined as array'));
        });
        it('should accept function', function () {
            const actual = make('foo', v => `[${v}]`);
            assert.deepStrictEqual(actual, '[foo]');
        });
        it('should accept string -> {type: "str"}', function () {
            const actual = make('', 'str');
            const expected = make('', {type: 'str'});
            assert.deepStrictEqual(actual, expected);
        });
        it('should accept nullable', function () {
            const actual = make(null, {type: 'str', nullable: true});
            const expected = null;
            assert.deepStrictEqual(actual, expected);
        });
        it('should accept object without [type] property -> {type: "obj", props: ...}', function () {
            const actual = make(null, {foo: 'str', bar: 'int', baz: 'bool'});
            const expected = make(null, {type: 'obj', props: {foo: 'str', bar: 'int', baz: 'bool'}});
            assert.deepStrictEqual(actual, expected);
        });
        it('should accept object type property as array -> {type: "obj", props: {..., type: [0]}}', function () {
            const actual = make(null, {type: ['str'], foo: 'str', bar: 'int', baz: 'bool'});
            const expected = make(null, {type: 'obj', props: {type: 'str', foo: 'str', bar: 'int', baz: 'bool'}});
            assert.deepStrictEqual(actual, expected);
        });
        it('🩼 When `expr` is an object , it is the same as `{type: "obj", props: ...}`, unless it has `type` property.', function () {
            assert.deepStrictEqual(make(null, {foo: 'int', bar: 'int'}), {foo: 0, bar: 0});
        });
        it('🩼 A way to remove special meaning from `type` property is to wrap its value into array', function () {
            assert.deepStrictEqual(make(null, {type: ['int'], foo: 'int', bar: 'int'}), {type: 0, foo: 0, bar: 0});
            assert.deepStrictEqual(make(null, {type: [{type: 'int', min: 15}], foo: 'int', bar: 'int'}), {type: 15, foo: 0, bar: 0});
        });
    });
    describe('built-in types • raw', function () {
        it('raw • always return input value', function () {
            assert.deepStrictEqual(make('ggg', 'raw'), 'ggg');
            assert.deepStrictEqual(make({foo: 1, bar: 2}, 'raw'), {foo: 1, bar: 2});
        });
    });
    describe('built-in types • any', function () {
    });
    describe('built-in types • null', function () {
        it('null • always return null discarding any input provided', function () {
            assert.deepStrictEqual(make(1, 'null'), null);
            assert.deepStrictEqual(make({foo: 1, bar: 2}, 'null'), null);
        });
    });
    describe('built-in types • const', function () {
        it('const • always return predefined value discarding any input provided', function () {
            const types = {
                apple: {type: 'const', value: 'apple'},
            };
            assert.deepStrictEqual(make('ggg', 'apple', types), 'apple');
        });
    });
    describe('built-in types • bool', function () {
        it('should cast the default value to a valid range', function () {
            assert.deepStrictEqual(make(null, {type: 'bool', default: ''}), false);
        });
    });
    describe('built-in types • int', function () {
        it('should cast the default value to a valid range', function () {
            assert.deepStrictEqual(make(null, {type: 'int', default: ''}), 0);
        });
    });
    describe('built-in types • float', function () {
        it('should cast the default value to a valid range', function () {
            assert.deepStrictEqual(make(null, {type: 'float', default: ''}), 0);
        });
    });
    describe('built-in types • str', function () {
        it('should cast the default value to a valid range', function () {
            assert.deepStrictEqual(make(null, {type: 'str', default: SP}), '');
        });
    });
    describe('built-in types • enum', function () {
        it('should throw "[type=enum] should have at least one option"', function () {
            assert.throws(() => make(null, 'enum'), new Error('[type=enum] should have at least one option'));
        });
    });
    describe('built-in types • array', function () {
        it('should pass basic tests for arrays', function () {
            assert.deepStrictEqual(make(null, {type: 'array', of: 'str'}), []);
            assert.deepStrictEqual(make('x', {type: 'array', of: 'str', min: 2}), ['x', '']);
            assert.deepStrictEqual(make(['1'], {type: 'array', of: 'int', min: 2}), [1, 0]);
        });
        it('arrays', function () {
            assert.deepStrictEqual(make(null, {type: 'array', of: 'bool'}), [], 'array of bool');
            assert.deepStrictEqual(make(null, {type: 'array', of: 'int'}), [], 'array of int');
            assert.deepStrictEqual(make(null, {type: 'array', of: 'float'}), [], 'array of float');
            assert.deepStrictEqual(make(null, {type: 'array', of: 'str'}), [], 'array of str');
        });
        it('array min=1', function () {
            assert.deepStrictEqual(make(null, {type: 'array', of: 'bool', min: 1}), [false], 'array of bool, min=1');
            assert.deepStrictEqual(make(null, {type: 'array', of: 'int', min: 1}), [0], 'array of int, min=1');
            assert.deepStrictEqual(make(null, {type: 'array', of: 'float', min: 1}), [0], 'array of float, min=1');
            assert.deepStrictEqual(make(null, {type: 'array', of: 'str', min: 1}), [''], 'array of str, min=1');
        });
        it('array of bool, min=1', function () {
            assert.deepStrictEqual(make([0, -1, 'a'], {type: 'array', of: 'bool'}), [false, true, true], 'array of bool, min=1');
            assert.deepStrictEqual(make('a', {type: 'array', of: 'int'}), [], 'array of int');
            assert.deepStrictEqual(make(null, {type: 'array', of: 'float'}), [], 'array of float');
            assert.deepStrictEqual(make(null, {type: 'array', of: 'str'}), [], 'array of str');
        });
    });
    describe('built-in types • tuple', function () {
        it('should throw "[type=tuple] should have at least one option"', function () {
            assert.throws(() => make(null, 'tuple'), new Error('[type=tuple] should have at least one option'));
        });
    });
    describe('built-in types • tags', function () {
        it('should throw "[type=tags] should have options defined"', function () {
            assert.throws(() => make(null, 'tags'), new Error('[type=tags] should have options defined'));
        });
    });
    describe('built-in types • obj', function () {
    });
    describe('built-in types • union', function () {
        it('should throw "Union type option not found"', function () {
            assert.throws(() => make(null, 'union'), new Error(`Union type option not found: [type / undefined]`));
        });
    });
    describe('edge', function () {
        // it('fn • always return predefined value discarding any input provided', function () {
        //     // ⚠️ Should it be [fn] or [value]?
        //     const types = {
        //         apple: {type: 'fn', fn: () => ({apple: 'foo'})},
        //     };
        //     assert.deepStrictEqual(make('ggg', 'apple', types), {apple: 'foo'});
        // });
    });
    describe('basic types', function () {
        it('defaults', function () {
            assert.deepStrictEqual(make(null, 'bool'), false);
            assert.deepStrictEqual(make(null, 'int'), 0);
            assert.deepStrictEqual(make(null, 'float'), 0);
            assert.deepStrictEqual(make(null, 'str'), '');
            assert.deepStrictEqual(make(null, 'array'), []);
            assert.deepStrictEqual(make(null, 'obj'), {});
        });
    });
    describe('nullable types should be marked explicitly', function () {
        it('null -> null', function () {
            assert.deepStrictEqual(make(null, {type: 'bool', nullable: true}), null);
            assert.deepStrictEqual(make(null, {type: 'int', nullable: true}), null);
            assert.deepStrictEqual(make(null, {type: 'float', nullable: true}), null);
            assert.deepStrictEqual(make(null, {type: 'str', nullable: true}), null);
            assert.deepStrictEqual(make(null, {type: 'array', nullable: true}), null);
            assert.deepStrictEqual(make(null, {type: 'obj', nullable: true}), null);
            assert.deepStrictEqual(make(null, {type: 'enum', nullable: true}), null);
        });
        it('undefined -> null', function () {
            assert.deepStrictEqual(make(undefined, {type: 'bool', nullable: true}), null);
            assert.deepStrictEqual(make(undefined, {type: 'int', nullable: true}), null);
            assert.deepStrictEqual(make(undefined, {type: 'float', nullable: true}), null);
            assert.deepStrictEqual(make(undefined, {type: 'str', nullable: true}), null);
            assert.deepStrictEqual(make(undefined, {type: 'array', nullable: true}), null);
            assert.deepStrictEqual(make(undefined, {type: 'obj', nullable: true}), null);
            assert.deepStrictEqual(make(undefined, {type: 'enum', nullable: true}), null);
        });
    });
    describe('edge cases', function () {
        it('NaN usually means that operands was malformed (e.g. 5/"8a")', function () {
            assert.deepStrictEqual(make(NaN, {type: 'bool', nullable: true}), false);
            assert.deepStrictEqual(make(NaN, {type: 'int', nullable: true}), 0);
            assert.deepStrictEqual(make(NaN, {type: 'float', nullable: true}), 0);
            assert.deepStrictEqual(make(NaN, {type: 'str', nullable: true}), '');
        });
        it('Infinity usually means division by zero', function () {
            assert.deepStrictEqual(make(Infinity, {type: 'bool', nullable: true}), true, '⚠️ gotcha');
            assert.deepStrictEqual(make(Infinity, {type: 'int', nullable: true}), Number.MAX_SAFE_INTEGER);
            assert.deepStrictEqual(make(Infinity, {type: 'float', nullable: true}), Number.MAX_VALUE, '⚠️ gotcha');
            assert.deepStrictEqual(make(Infinity, {type: 'str', nullable: true}), '');
        });
        it('-Infinity', function () {
            assert.deepStrictEqual(make(-Infinity, {type: 'bool', nullable: true}), true, '⚠️ gotcha');
            assert.deepStrictEqual(make(-Infinity, {type: 'int', nullable: true}), Number.MIN_SAFE_INTEGER);
            assert.deepStrictEqual(make(-Infinity, {type: 'float', nullable: true}), -Number.MAX_VALUE, '⚠️ gotcha');
            assert.deepStrictEqual(make(-Infinity, {type: 'str', nullable: true}), '');
        });
    });
    describe('custom types', function () {
        it('custom type #1', function () {
            const actual = make(null, 'fps', {
                fps: {type: 'int', min: 1, max: 60},
                fps_limit: {type: 'int', min: 1, max: 60},
            });
            assert.deepStrictEqual(actual, 1);
        });
        it('custom type #2', function () {
            const actual = make(30, 'fps', {
                fps: {type: 'int', min: 1, max: 60},
                fps_limit: {type: 'int', min: 1, max: 60},
            });
            assert.deepStrictEqual(actual, 30);
        });
        it('alias to int', function () {
            const types = {
                int2: {type: 'int', min: 50},
                int3: {type: 'int2', min: 100},
                int4: {type: 'int3', max: 200},
            };
            assert.deepStrictEqual(make(null, 'int2', types), 50);
            assert.deepStrictEqual(make(null, 'int3', types), 100);
            assert.deepStrictEqual(make(1000, 'int4', types), 200);
        });
        it('alias to custom type', function () {
            const types = {
                person: function (input, expr) {
                    const prefix = make(expr.prefix, 'str');
                    return prefix + make(input, 'str');
                },
                person2: {type: 'person', prefix: '222'},
                person3: {type: 'person2', prefix: '333'},
            };
            assert.deepStrictEqual(make('ggg', 'person', types), 'ggg');
            assert.deepStrictEqual(make('ggg', 'person2', types), '222ggg');
            assert.deepStrictEqual(make('ggg', 'person3', types), '333ggg');
        });
        it('expr: function', function () {
            assert.deepStrictEqual(make('ggg', v => `[${v}]`), '[ggg]');
        });
        it('type: function', function () {
            assert.deepStrictEqual(make('ggg', 'custom', {custom: v => `[${v}]`}), '[ggg]');
        });
        it('{type: function}', function () {
            assert.deepStrictEqual(make('ggg', 'custom', {custom: {type: v => `[${v}]`}}), '[ggg]');
        });
    });
    describe('objects', function () {
        it('property: function', function () {
            const actual = make(null, {enabled: 'bool', foo: v => `[${v}]`});
            const expected = {enabled: false, foo: '[undefined]'};
            assert.deepStrictEqual(actual, expected);
        });
        it('edge case: union objects #1', function () {
            const types = {
                period: {
                    type: 'union',
                    prop: 'type',
                    default: 'today',
                    options: {
                        today: {value: 'null'},
                        current_week: {value: 'null'},
                        current_month: {value: 'null'},
                        yesterday: {value: 'null'},
                        last_24hours: {value: 'null'},
                        last_7days: {value: 'null'},
                        last_30days: {value: 'null'},
                        last_90days: {value: 'null'},
                        last_365days: {value: 'null'},
                        custom: {
                            value: {
                                begin: 'int',
                                end: {type: 'int', min: 500},
                            },
                        },
                    },
                },
            };
            // https://developers.google.com/drive/api/reference/rest/v3/about/get?apix_params=%7B%22fields%22%3A%22*%22%7D
            // https://developers.google.com/drive/api/reference/rest/v3/files/list?apix_params=%7B%22fields%22%3A%22*%22%7D
            assert.deepStrictEqual(make(null, 'period', types), {type: 'today', value: null});
            assert.deepStrictEqual(make({type: 'xxx'}, 'period', types), {type: 'today', value: null});
            assert.deepStrictEqual(make({type: 'today'}, 'period', types), {type: 'today', value: null});
            assert.deepStrictEqual(make({type: 'yesterday'}, 'period', types), {type: 'yesterday', value: null});
            assert.deepStrictEqual(make({type: 'custom', value: {begin: 100, end: 200}}, 'period', types), {type: 'custom', value: {begin: 100, end: 500}});
        });
        it('edge case: union objects', function () {
            const actual = make({type: 'banner'}, 'item', {
                url: {type: 'str', default: 'https://example.com/'},
                uint: {type: 'int', min: 0},
                item: {
                    type: 'union',
                    prop: 'type', // banner | image | video
                    options: {
                        banner: {
                            thumbnail_url: 'url',
                            page_url: 'url',
                            width: 'uint',
                            height: 'uint',
                        },
                        image: {
                            thumbnail_url: 'url',
                            width: 'uint',
                            height: 'uint',
                        },
                        video: {
                            thumbnail_url: 'url',
                            width: 'uint',
                            height: 'uint',
                            fps: 'fps',
                            bitrate: 'uint',
                            duration: 'float',
                        },
                    },
                },
            });
            const expected1 = {
                type: 'banner',
                thumbnail_url: 'https://example.com/',
                page_url: 'https://example.com/',
                width: 0,
                height: 0,
            };
            assert.deepStrictEqual(actual, expected1);
        });
        xit('edge case: nullable properties (present but null)', function () {
            // ...
        });
        xit('edge case: optional properties (might be absent)', function () {
            // ...
        });
        it('objects1', function () {
            const types = {
                person: {
                    company: 'company',
                    salary: {type: 'int', min: 0, nullable: true},
                    company2: {type: 'company', nullable: true}, // optional
                },
                company: {
                    name: 'str', // required
                    balance: {type: 'int', nullable: true},
                },
            };
            const actual = make({company2: {name: 'ggg'}}, 'person', types);
            const expected = {
                salary: null,
                company: {name: '', balance: null},
                company2: {name: 'ggg', balance: null},
            };
            assert.deepStrictEqual(actual, expected, 'basic object');
        });
        it('objects2', function () {
            const types = {
                movie: {
                    name: 'str',
                    url: {type: 'str', nullable: true},
                    year: {type: 'int', min: 1900, max: 2500, nullable: true},
                    genres: {type: 'array', of: 'str', nullable: true},
                    actors: {type: 'array', of: 'actor', min: 1},
                },
                actor: {
                    name: 'str',
                },
            };
            const input = {
                name: 'Ice Age',
                url: 'https://www.imdb.com/title/tt0268380/',
                year: '2002',
                genres: [
                    'Animation', 'Adventure', 'Comedy', 'Family',
                ],
                actors: [
                    {name: 'Manny the mammoth'},
                    {name: 'Sid the loquacious sloth'},
                    {name: 'Diego the sabre-toothed tiger'},
                ],
            };
            const expected = {
                url: 'https://www.imdb.com/title/tt0268380/',
                name: 'Ice Age',
                year: 2002,
                genres: [
                    'Animation', 'Adventure', 'Comedy', 'Family',
                ],
                actors: [
                    {name: 'Manny the mammoth'},
                    {name: 'Sid the loquacious sloth'},
                    {name: 'Diego the sabre-toothed tiger'},
                ],
            };
            const actual = make(input, 'movie', types);
            assert.deepStrictEqual(actual, expected);
        });
        it('delegate value creation to a function', function () {
            const types = {
                Custom: function (input) {
                    return {__delegated__: true, input};
                },
            };
            const actual = make({pub_id: 'banner1'}, 'Custom', types);
            assert.deepStrictEqual(actual, {__delegated__: true, input: {pub_id: 'banner1'}});
        });
        // it('when one property is taken from another #1', function () {
        //     // - convert obsolete property to new property
        //     // - converting obsolete format to new format
        //     const types = {
        //         Banner: {
        //             uid: {read: true, from: 'pub_id'},
        //         },
        //     };
        //     const actual = make({pub_id: 'banner1'}, 'Banner', types);
        //     assert.deepStrictEqual(actual, {type: 'banner', uid: 'banner1'});
        // });
        // it('when one property is taken from another #2', function () {
        //     // - convert obsolete property to new property
        //     // - converting obsolete format to new format
        //     const types = {
        //         Banner: {
        //             uid: {type: 'str', from: 'pub_id'}, // from pub_id
        //         },
        //     };
        //     const actual = make({pub_id: 'banner1'}, 'Banner', types);
        //     assert.deepStrictEqual(actual, {type: 'banner', uid: 'banner1'});
        // });
        xit('objects.dependable.hooks #1', function () {
            const types = {
                tmp: function (input) {
                    const out = make(input, 'anon', {
                        fps: {type: 'int', min: 1, max: 60},
                        fps_limit: {type: 'int', min: 1, max: 60},
                    });
                    out.fps = Math.min(out.fps, out.fps_limit);
                    return out;
                },
            };
            const input = {fps: 30, fps_limit: 45};
            const expected = {
                fps: 30,
                fps_limit: 45,
            };
            const actual = make(input, 'tmp', types);
            assert.deepStrictEqual(actual, expected);
        });
        it('should return classes', function () {
            // - convert obsolete property to new property
            // - converting obsolete format to new format
            class Banner {
                constructor(input) {
                    Object.assign(this, make({uid: input.pub_id, ...input}, {
                        uid: 'str',
                        width: 'int',
                        height: 'int'
                    }));
                }
                publish() {
                    console.log('Publishing...');
                }
            }
            const types = {
                Banner: v => new Banner(v),
            };
            const actual = make({pub_id: 'banner1'}, 'Banner', types);
            assert.ok(actual instanceof Banner);
            assert.deepEqual(actual, {uid: 'banner1', width: 0, height: 0});
        });
    });
    describe('scenario: an array of tabs', function () {
        // - an array of tabs
        // - each tab must have a unique name
        // - only one tab can be active at a time
        // - at least one tab must be enabled
        xit('each tab must have a unique name', function () {
            const types = {
                tab: {
                    name: 'str',
                    label: 'str',
                    active: 'bool',
                    disabled: 'bool',
                },
                tabs: {type: 'array', of: 'tab', before: v => v, after: v => array_unique(v, vv => vv.name)}
            };
            const tabs = make([{name: 'foo'}, {name: 'bar'}, {name: 'bar'}], 'tabs', types);
            const expected = [{name: 'foo'}, {name: 'bar'}];
            assert.deepStrictEqual(tabs, expected);
        });
    });
    describe('some random scenarios', function () {
        let next_uid = 1;
        const types = {
            // {type: 'uid', prefix: 'banner_'}
            uid: function (value, expr, types) {
                if (typeof value === 'string' && value.trim()) {
                    return value;
                }
                const prefix = make(expr.prefix, 'str');
                return `${prefix}a${next_uid++}`;
            },
        };
        it('uid • generate new uid only when necessary', function () {
            next_uid = 1;
            assert.deepStrictEqual(make(null, 'uid', types), 'a1');
            assert.deepStrictEqual(make(null, 'uid', types), 'a2');
            assert.deepStrictEqual(make('ggg', 'uid', types), 'ggg');
            assert.deepStrictEqual(make(null, 'uid', types), 'a3');
            assert.deepStrictEqual(make(null, {type: 'uid', prefix: 'usr_'}, types), 'usr_a4');
        });
        it('pub_id -> uid', function () {
            next_uid = 1;
            const actual = make({pub_id: 'banner_1'}, 'Banner', {
                ...types,
                Banner: {
                    type: 'obj',
                    transform: function (v) {
                        return {...v, uid: v.uid ?? v.pub_id};
                    },
                    props: {
                        uid: {type: 'uid', prefix: 'banner_'},
                        title: {type: 'str', nullable: true},
                        width: {type: 'int', min: 0},
                        height: {type: 'int', min: 0},
                    },
                },
            });
            const expected = {uid: 'banner_1', title: null, width: 0, height: 0};
            assert.deepStrictEqual(actual, expected);
        });
        it('{first, last} -> name', function () {
            next_uid = 1;
            const actual = make({pub_id: 'user_1', first: 'Jack', last: 'White'}, 'User', {
                ...types,
                User: {
                    type: 'obj',
                    transform: function (v) {
                        return {
                            ...v,
                            uid: v.uid ?? v.pub_id,
                            name: [v.first, v.last].filter(v => v).join(' '),
                        };
                    },
                    props: {
                        uid: {type: 'uid', prefix: 'usr_'},
                        name: {type: 'str', nullable: true},
                    },
                },
            });
            const expected = {uid: 'user_1', name: 'Jack White'};
            assert.deepStrictEqual(actual, expected);
        });
        it('name -> {first, last}', function () {
            next_uid = 1;
            const actual = make({pub_id: 'user_1', name: 'Jack White'}, 'User', {
                ...types,
                User: {
                    type: 'obj',
                    transform: function (v) {
                        const [first, last] = safe_str(v?.name).split(' ');
                        return {
                            ...v,
                            uid: v.uid ?? v.pub_id,
                            first,
                            last,
                        };
                    },
                    props: {
                        uid: {type: 'uid', prefix: 'usr_'},
                        first: {type: 'str', nullable: true},
                        last: {type: 'str', nullable: true},
                    },
                },
            });
            const expected = {uid: 'user_1', first: 'Jack', last: 'White'};
            assert.deepStrictEqual(actual, expected);
        });
        it('weekday', function () {
            const actual = make('Sat', {type: 'enum', options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']});
            const expected = 'Sat';
            assert.deepStrictEqual(actual, expected);
        });
        it('weekdays', function () {
            const types = {
                weekdays: function (input, expr, types) {
                    const tmp = make(input, {type: 'array', of: 'str'});
                    const allowed = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    return array_unique(tmp.filter(v => allowed.includes(v)));
                },
            };
            const actual = make(['Thu', 'Sat', 'gg'], 'weekdays', types);
            const expected = ['Thu', 'Sat'];
            assert.deepStrictEqual(actual, expected);
        });
        it('tags', function () {
            const actual = make(['Sat', 'Thu', 'gg'], {type: 'tags', options: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']});
            const expected = ['Sat', 'Thu'];
            assert.deepStrictEqual(actual, expected);
        });
        it('weekdays-map', function () {
            const types = {
                weekdays: {
                    Mon: 'bool',
                    Tue: 'bool',
                    Wed: 'bool',
                    Thu: 'bool',
                    Fri: 'bool',
                    Sat: 'bool',
                    Sun: 'bool',
                },
            };
            const actual = make({Thu: 1, Sat: 1, ggg: 1}, 'weekdays', types);
            const expected = {Mon: false, Tue: false, Wed: false, Thu: true, Fri: false, Sat: true, Sun: false};
            assert.deepStrictEqual(actual, expected);
        });
        it('union types', function () {
            // https://medium.com/hoppinger/type-driven-development-for-single-page-applications-bf8ee98d48e2
            // type ApiResult<a> =
            //   | { kind: 'success', value: a }
            //   | { kind: 'not-found' }
            //   | { kind: 'unauthorized' }
            //   | { kind: 'error', error?: Error }
            const types = {
                error: {
                    message: 'str',
                },
                response: {
                    type: 'union',
                    prop: 'kind',
                    options: {
                        error: 'error',
                        success: {
                            value: 'any',
                        },
                        'not-found': {},
                        'unauthorized': {},
                    },
                }
            };
            assert.deepStrictEqual(make({kind: 'error', message: 'ggg'}, 'response', types), {kind: 'error', message: 'ggg'});
            assert.deepStrictEqual(make({kind: 'success', value: 1}, 'response', types), {kind: 'success', value: 1});
            assert.deepStrictEqual(make({kind: 'success', value: {a: 1, b: 2, c: 3}}, 'response', types), {kind: 'success', value: {a: 1, b: 2, c: 3}});
            assert.deepStrictEqual(make({kind: 'not-found'}, 'response', types), {kind: 'not-found'});
            assert.deepStrictEqual(make({kind: 'unauthorized'}, 'response', types), {kind: 'unauthorized'});
        });
        it('optional fields', function () {
            const types = {
                error: {
                    message: 'str',
                    stack: {type: 'array', of: 'str', optional: true},
                },
            };
            assert.deepStrictEqual(make({message: 'ggg'}, 'error', types), {message: 'ggg'});
            assert.deepStrictEqual(make({message: 'ggg', stack: [111, '222']}, 'error', types), {message: 'ggg', stack: ['111', '222']});
        });
        it('enum transform: was - on,off; now - enabled,disabled', function () {
            const types = {
                switch: {type: 'enum', transform: {off: 'disabled', on: 'enabled'}, options: ['disabled', 'enabled']},
            };
            assert.deepStrictEqual(make(null, 'switch', types), 'disabled');
            assert.deepStrictEqual(make('off', 'switch', types), 'disabled');
            assert.deepStrictEqual(make('on', 'switch', types), 'enabled');
            assert.deepStrictEqual(make('enabled', 'switch', types), 'enabled');
        });
        it('array of exact 3 members', function () {
            const types = {
                in: {type: 'enum', options: ['none', 'in1', 'in2', 'in3', 'in4']},
                stay: {type: 'enum', options: ['none', 'stay1', 'stay2', 'stay3']},
                out: {type: 'enum', options: ['none', 'out1', 'out2', 'out3']},
                transitions: function (input, expr, types) {
                    const [a, b, c] = make(input, 'array');
                    return [make(a, 'in', types), make(b, 'stay', types), make(c, 'out', types)];
                },
            };
            assert.deepStrictEqual(make(null, 'transitions', types), ['none', 'none', 'none']);
        });
        it('array of exact 3 members (using tuples)', function () {
            const types = {
                tuple: function (value, expr, types) {
                    const items = make({type: 'array', of: 'any'}, expr.items, types);
                    const values = make({type: 'array', of: 'any'}, value, types);
                    return items.map((v,i) => make(v, values[i], types));
                },
                in: {type: 'enum', options: ['none', 'in1', 'in2', 'in3', 'in4']},
                stay: {type: 'enum', options: ['none', 'stay1', 'stay2', 'stay3']},
                out: {type: 'enum', options: ['none', 'out1', 'out2', 'out3']},
                transitions: {type: 'tuple', items: ['in', 'stay', 'out']},
            };
            assert.deepStrictEqual(make(null, 'transitions', types), ['none', 'none', 'none']);
            assert.deepStrictEqual(make([null, 'stay2', 'out5'], 'transitions', types), ['none', 'stay2', 'none']);
        });
        it('union: string or number', function () {
            const types = {
                str_num: function (input) {
                    if (is_num(input)) {
                        return make(input, 'float');
                    }
                    return make(input, 'str');
                },
            };
            assert.deepStrictEqual(make(null, 'str_num', types), '');
            assert.deepStrictEqual(make('555', 'str_num', types), '555');
            assert.deepStrictEqual(make(555, 'str_num', types), 555);
            assert.deepStrictEqual(make(NaN, 'str_num', types), '');
        });
        it('px', function () {
            const types = {
                px: function (input) {
                    const tmp = make(input, 'int');
                    return tmp ? `${tmp}px` : '0';
                },
                position: {
                    top: 'px',
                    left: 'px',
                },
            };
            assert.deepStrictEqual(make(null, 'px', types), '0');
            assert.deepStrictEqual(make(5, 'px', types), '5px');
            assert.deepStrictEqual(make({top: 5, left: 0}, 'position', types), {top: '5px', left: '0'});
        });
        it('array of 3 Banner: should return an array of 3 different banenrs', function () {
            let next_uid = 1;
            const types = {
                // {type: 'uid', prefix: 'banner_'}
                uid: function (input, expr, types) {
                    if (typeof input === 'string' && input.trim()) {
                        return input;
                    }
                    const prefix = make(expr.prefix, 'str');
                    return `${prefix}a${next_uid++}`;
                },
                Banner: {
                    uid: {type: 'uid', prefix: 'banner_'},
                },
            };
            const expected = [{uid: 'banner_a1'}, {uid: 'banner_a2'}, {uid: 'banner_a3'}];
            assert.deepStrictEqual(make(null, {type: 'array', of: 'Banner', min: 3}, types), expected);
        });
        it('array of 2 Banner, min=4: should return an array of 4 different banners', function () {
            let next_uid = 1;
            const types = {
                // {type: 'uid', prefix: 'banner_'}
                uid: function (input, expr, types) {
                    if (typeof input === 'string' && input.trim()) {
                        return input;
                    }
                    const prefix = make(expr.prefix, 'str');
                    return `${prefix}a${next_uid++}`;
                },
                Banner: {
                    uid: {type: 'uid', prefix: 'banner_'},
                },
            };
            const expected = [{uid: 'a'}, {uid: 'b'}, {uid: 'banner_a1'}, {uid: 'banner_a2'}];
            assert.deepStrictEqual(make([{uid: 'a'}, {uid: 'b'}], {type: 'array', of: 'Banner', min: 4}, types), expected);
        });
    });
});

function array_unique(values, fn = v => v)
{
    const set = new Set();
    return values.filter(function (item) {
        const token = fn(item);
        if (set.has(token)) {
            return false;
        }
        set.add(token);
        return true;
    });
}
