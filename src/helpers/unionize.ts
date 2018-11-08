import unionize, { DictRecord } from 'unionize';

// When nesting unions, values and tags are merged, unless we specify a `value` property. This
// helper enforces that.
// https://github.com/pelotom/unionize/issues/46
const curriedUnionizeSafe = <TagProp extends string>(tag: TagProp) => <A extends DictRecord>(
  union: A,
) => unionize(union, tag, 'value');

// 'tag' is same as default.
export const unionizeSafe = curriedUnionizeSafe('tag');

// Tag must be `type` to conform to expected Redux action type.
export const unionizeReduxAction = curriedUnionizeSafe('type');
