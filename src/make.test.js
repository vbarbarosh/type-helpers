const assert = require('assert');
const make = require('./make');

const edge_values = [
    {label: "''", value: ''},
    {label: 'false', value: false},
    {label: '0', value: 0},
    {label: 'NaN', value: NaN},
    {label: 'Infinity', value: Infinity},
    {label: '-Infinity', value: -Infinity},
    {label: 'Number.MIN_VALUE', value: Number.MIN_VALUE},
    {label: 'Number.POSITIVE_INFINITY', value: Number.POSITIVE_INFINITY},
    {label: 'Number.NEGATIVE_INFINITY', value: Number.NEGATIVE_INFINITY},
    {label: 'array', value: []},
    {label: 'object', value: {}},
    {label: 'function', value: function () {}},
    {label: 'Symbol()', value: Symbol()},
];

describe('make', function () {
    describe('edge cases', function () {
        it('🩼 When `expr` is an object , it is the same as `{type: "object", props: ...}`, unless it has `type` property.', function () {
            assert.deepStrictEqual(make({foo: 'int', bar: 'int'}), {foo: 0, bar: 0});
        });
        it('🩼 A way to remove special meaning from `type` property is to wrap its value into array', function () {
            assert.deepStrictEqual(make({type: ['int'], foo: 'int', bar: 'int'}), {type: 0, foo: 0, bar: 0});
            assert.deepStrictEqual(make({type: [{type: 'int', min: 15}], foo: 'int', bar: 'int'}), {type: 15, foo: 0, bar: 0});
        });
    });
    describe('errors', function () {
        it('throw if type was defined as array', function () {
            assert.throws(function () {
                make('apple', '', {apple: []});
            });
        });
    });
    describe('edge', function () {
        it('null • always return null discarding any input provided', function () {
            assert.deepStrictEqual(make('null', 1), null);
            assert.deepStrictEqual(make('null', {foo: 1, bar: 2}), null);
        });
        it('const • always return predefined value discarding any input provided', function () {
            const types = {
                apple: {type: 'const', value: 'apple'},
            };
            assert.deepStrictEqual(make('apple', 'ggg', types), 'apple');
        });
        it('fn • always return predefined value discarding any input provided', function () {
            // ⚠️ Should it be [fn] or [value]?
            const types = {
                apple: {type: 'fn', fn: () => ({apple: 'foo'})},
            };
            assert.deepStrictEqual(make('apple', 'ggg', types), {apple: 'foo'});
        });
        it('raw • always return input value', function () {
            assert.deepStrictEqual(make('raw', 'ggg'), 'ggg');
            assert.deepStrictEqual(make('raw', {foo: 1, bar: 2}), {foo: 1, bar: 2});
        });
    });
    describe('basic types', function () {
        it('should throws', function () {
            assert.throws(() => make(), /^Error: Empty expressions are not allowed$/);
            assert.throws(() => make('enum'), /^Error: enum types should have at least one option$/);
        });
        it('defaults', function () {
            assert.deepStrictEqual(make('bool'), false);
            assert.deepStrictEqual(make('int'), 0);
            assert.deepStrictEqual(make('float'), 0);
            assert.deepStrictEqual(make('string'), '');
            assert.deepStrictEqual(make('array'), []);
            assert.deepStrictEqual(make('object'), {});
        });
    });
    describe('nullable types should be marked explicitly', function () {
        it('null -> null', function () {
            assert.deepStrictEqual(make({type: 'bool', nullable: true}, null), null);
            assert.deepStrictEqual(make({type: 'int', nullable: true}, null), null);
            assert.deepStrictEqual(make({type: 'float', nullable: true}, null), null);
            assert.deepStrictEqual(make({type: 'string', nullable: true}, null), null);
            assert.deepStrictEqual(make({type: 'array', nullable: true}, null), null);
            assert.deepStrictEqual(make({type: 'object', nullable: true}, null), null);
            assert.deepStrictEqual(make({type: 'enum', nullable: true}, null), null);
        });
        it('undefined -> null', function () {
            assert.deepStrictEqual(make({type: 'bool', nullable: true}, undefined), null);
            assert.deepStrictEqual(make({type: 'int', nullable: true}, undefined), null);
            assert.deepStrictEqual(make({type: 'float', nullable: true}, undefined), null);
            assert.deepStrictEqual(make({type: 'string', nullable: true}, undefined), null);
            assert.deepStrictEqual(make({type: 'array', nullable: true}, undefined), null);
            assert.deepStrictEqual(make({type: 'object', nullable: true}, undefined), null);
            assert.deepStrictEqual(make({type: 'enum', nullable: true}, undefined), null);
        });
    });
    describe('edge cases', function () {
        it('NaN usually means that operands was malformed (e.g. 5/"8a")', function () {
            assert.deepStrictEqual(make({type: 'bool', nullable: true}, NaN), false);
            assert.deepStrictEqual(make({type: 'int', nullable: true}, NaN), 0);
            assert.deepStrictEqual(make({type: 'float', nullable: true}, NaN), 0);
            assert.deepStrictEqual(make({type: 'string', nullable: true}, NaN), '');
        });
        it('Infinity usually means division by zero', function () {
            assert.deepStrictEqual(make({type: 'bool', nullable: true}, Infinity), true, '⚠️ gotcha');
            assert.deepStrictEqual(make({type: 'int', nullable: true}, Infinity), 0);
            assert.deepStrictEqual(make({type: 'float', nullable: true}, Infinity), Number.MAX_VALUE, '⚠️ gotcha');
            assert.deepStrictEqual(make({type: 'string', nullable: true}, Infinity), '');
        });
        it('-Infinity', function () {
            assert.deepStrictEqual(make({type: 'bool', nullable: true}, -Infinity), true, '⚠️ gotcha');
            assert.deepStrictEqual(make({type: 'int', nullable: true}, -Infinity), 0);
            assert.deepStrictEqual(make({type: 'float', nullable: true}, -Infinity), -Number.MAX_VALUE, '⚠️ gotcha');
            assert.deepStrictEqual(make({type: 'string', nullable: true}, -Infinity), '');
        });
    });
    describe('arrays', function () {
        it('arrays', function () {
            assert.deepStrictEqual(make({type: 'array', of: 'bool'}), [], 'array of bool');
            assert.deepStrictEqual(make({type: 'array', of: 'int'}), [], 'array of int');
            assert.deepStrictEqual(make({type: 'array', of: 'float'}), [], 'array of float');
            assert.deepStrictEqual(make({type: 'array', of: 'string'}), [], 'array of string');
        });
        it('array min=1', function () {
            assert.deepStrictEqual(make({type: 'array', of: 'bool', min: 1}), [false], 'array of bool, min=1');
            assert.deepStrictEqual(make({type: 'array', of: 'int', min: 1}), [0], 'array of int, min=1');
            assert.deepStrictEqual(make({type: 'array', of: 'float', min: 1}), [0], 'array of float, min=1');
            assert.deepStrictEqual(make({type: 'array', of: 'string', min: 1}), [''], 'array of string, min=1');
        });
        it('array of bool, min=1', function () {
            assert.deepStrictEqual(make({type: 'array', of: 'bool'}, [0, -1, 'a']), [false, true, true], 'array of bool, min=1');
            assert.deepStrictEqual(make({type: 'array', of: 'int'}, 'a'), [], 'array of int');
            assert.deepStrictEqual(make({type: 'array', of: 'float'}), [], 'array of float');
            assert.deepStrictEqual(make({type: 'array', of: 'string'}), [], 'array of string');
        });
    });
    describe('custom types', function () {
        it('custom type #1', function () {
            const actual = make('fps', null, {
                fps: {type: 'int', min: 1, max: 60},
                fps_limit: {type: 'int', min: 1, max: 60},
            });
            assert.deepStrictEqual(actual, 1);
        });
        it('custom type #2', function () {
            const actual = make('fps', 30, {
                fps: {type: 'int', min: 1, max: 60},
                fps_limit: {type: 'int', min: 1, max: 60},
            });
            assert.deepStrictEqual(actual, 30);
        });
    });
    describe('objects', function () {
        it('edge case: dynamic objects #1', function () {
            const types = {
                period: {
                    type: 'dynamic',
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
            assert.deepStrictEqual(make('period', null, types), {type: 'today', value: null});
            assert.deepStrictEqual(make('period', {type: 'xxx'}, types), {type: 'today', value: null});
            assert.deepStrictEqual(make('period', {type: 'today'}, types), {type: 'today', value: null});
            assert.deepStrictEqual(make('period', {type: 'yesterday'}, types), {type: 'yesterday', value: null});
            assert.deepStrictEqual(make('period', {type: 'custom', value: {begin: 100, end: 200}}, types), {type: 'custom', value: {begin: 100, end: 500}});
        });
        it('edge case: dynamic objects', function () {
            const actual = make('item', {type: 'banner'}, {
                url: {type: 'string', default: 'https://example.com/'},
                uint: {type: 'int', min: 0},
                item: {
                    type: 'dynamic',
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
                    name: 'string', // required
                    balance: {type: 'int', nullable: true},
                },
            };
            const actual = make({type: 'person'}, {company2: {name: 'ggg'}}, types);
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
                    name: 'string',
                    url: {type: 'string', nullable: true},
                    year: {type: 'int', min: 1900, max: 2500, nullable: true},
                    genres: {type: 'array', of: 'string', nullable: true},
                    actors: {type: 'array', of: 'actor', min: 1},
                },
                actor: {
                    name: 'string',
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
            const actual = make({type: 'movie'}, input, types);
            assert.deepStrictEqual(actual, expected);
        });
        it('delegate a value create to a function', function () {
            const types = {
                Custom: function (input) {
                    return {__delegated__: true, input};
                },
            };
            const actual = make('Custom', {pub_id: 'banner1'}, types);
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
        //     const actual = make('Banner', {pub_id: 'banner1'}, types);
        //     assert.deepStrictEqual(actual, {type: 'banner', uid: 'banner1'});
        // });
        // it('when one property is taken from another #2', function () {
        //     // - convert obsolete property to new property
        //     // - converting obsolete format to new format
        //     const types = {
        //         Banner: {
        //             uid: {type: 'string', from: 'pub_id'}, // from pub_id
        //         },
        //     };
        //     const actual = make('Banner', {pub_id: 'banner1'}, types);
        //     assert.deepStrictEqual(actual, {type: 'banner', uid: 'banner1'});
        // });
        it('objects.dependable.hooks #1', function () {
            const types = {
                tmp: function (input) {
                    const out = make('anon', input, {
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
            const actual = make('tmp', input, types);
            assert.deepStrictEqual(actual, expected);
        });
        it('should return classes', function () {
            // - convert obsolete property to new property
            // - converting obsolete format to new format
            class Banner {
                constructor(input) {
                    const expr = {uid: 'string', width: 'int', height: 'int'};
                    Object.assign(this, make(expr, {...input, uid: input.uid ?? input.pub_id}, {}));
                }
                publish() {
                    console.log('Publishing...');
                }
            }
            const types = {
                Banner: {type: 'fn', fn: v => new Banner(v)},
            };
            const actual = make('Banner', {pub_id: 'banner1'}, types);
            assert.ok(actual instanceof Banner);
            assert.deepEqual(actual, {uid: 'banner1', width: 0, height: 0});
        });
    });
});
