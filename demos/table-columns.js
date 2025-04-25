const cli = require('@vbarbarosh/node-helpers/src/cli');
const ignore = require('@vbarbarosh/node-helpers/src/ignore');
const is_fn = require('../src/is_fn');
const make = require('../src/make');
let next_uid = 1;

cli(main);

async function main()
{
    console.log(make_columns([
        {label: '', component: 'page-workspace-banner-sizes-star-td', class: 'c'},
        {label: 'Size', read: v => `${v.banner_width}x${v.banner_height}`, class: 'c', class_td: 'fw5 bn-color-black'},
        {label: 'Tag', component: 'page-workspace-banner-sizes-tag-td', class: 'c'},
        {label: 'Title', component: 'page-workspace-banner-sizes-title-td'},
        {label: 'Updated', read: v => format_date_human(v.updated_at), class: 'r nowrap'},
        {label: '', component: 'page-workspace-banner-sizes-popover'},
    ]));
}

function make_columns(input)
{
    return make(input, 'columns', {
        // {type: 'uid', prefix: 'banner_'}
        uid: function (input, params, types) {
            const s = make(input, 'str').trim();
            if (s) {
                return s;
            }
            const {prefix} = make(params, {prefix: 'str'});
            return `${prefix}a${next_uid++}`;
        },
        columns: {type: 'array', of: 'column'},
        column: {
            type: 'obj',
            props: {
                key: 'uid',
                label: 'str',
                class_th: {type: 'str', nullable: true},
                class_td: {type: 'str', nullable: true},
                read: v => is_fn(v) ? v : ignore,
                slot: {type: 'str', nullable: true},
                component: {type: 'str', nullable: true},
                component_td: {type: 'str', nullable: true},
            },
            before: function (input) {
                const {key, label, class: _class, class_th, class_td, component, component_td} = make(input, {
                    key: 'str', label: 'str',
                    class: 'str', class_th: 'str', class_td: 'str', component: 'str', component_td: 'str'});
                return {...input,
                    key: key || label,
                    label,
                    component_td: component_td || (component.endsWith('-td') ? component : null),
                    class_th: `${_class} ${class_th}`.trim() || null,
                    class_td: `${_class} ${class_td}`.trim() || null,
                };
            },
        },
    });
}

// key: column.key || column.uid || column.label || `col:${i}`,
// label: column.label,
// class_th: `${column.class||''} ${column.class_th||''}`.trim() || null,
// class_td: `${column.class||''} ${column.class_td||''}`.trim() || null,
// read: column.read || ignore,
// slot: column.slot || null,
// component: column.component || null,
// component_td: column.component_td || (column.component && column.component.endsWith('-td') ? column.component : null),
