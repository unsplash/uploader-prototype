import { Option } from 'funfix-core';
import { isOptionSome } from './option';

// https://www.haskell.org/hoogle/?hoogle=catMaybes
// https://github.com/gcanti/fp-ts/blob/fd0ccf39bb52622f93e01fb7b9bcb6c955d634fe/docs/Array.md#catoptions
const catOptions = <T>(options: Option<T>[]): T[] =>
  options.filter(isOptionSome).map(some => some.value);

// https://ramdajs.com/docs/#sequence
// Return Some of a list if all list items are Some, otherwise we return None.
const sequenceOptions = <T extends {}>(options: Option<T>[]): Option<T[]> =>
  options.reduce(
    (maybeValues, maybeValue) =>
      Option.map2(maybeValues, maybeValue, (values, value) => values.concat(value)),
    Option.some([] as T[]),
  );

// https://ramdajs.com/docs/#traverse
// https://github.com/gcanti/fp-ts/blob/fd0ccf39bb52622f93e01fb7b9bcb6c955d634fe/docs/Array.md#traverse
export const traverseOptions = <A, B>(fn: (value: A) => Option<B>) => (values: A[]): Option<B[]> =>
  sequenceOptions(values.map(fn));

// https://github.com/gcanti/fp-ts/blob/fd0ccf39bb52622f93e01fb7b9bcb6c955d634fe/docs/Array.md#mapoption
// https://package.elm-lang.org/packages/elm-lang/core/latest/List#filterMap
export const filterMap = <A, B>(fn: (value: A) => Option<B>) => (values: A[]): B[] => {
  const maybeBs = values.map(fn);
  return catOptions(maybeBs);
};
