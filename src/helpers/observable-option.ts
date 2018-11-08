import { Option } from 'funfix-core';
import { OperatorFunction, pipe } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { isOptionSome } from './option';

export const catOption$ = <T>(): OperatorFunction<Option<T>, T> =>
  pipe(
    filter(isOptionSome),
    map(some => some.value),
  );

export const filterMap = <T, B>(mapFn: (t: T) => Option<B>): OperatorFunction<T, B> =>
  pipe(
    map(mapFn),
    catOption$(),
  );
