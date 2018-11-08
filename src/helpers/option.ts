import { Option, TSome } from 'funfix-core';

export const isOptionSome = <T>(option: Option<T>): option is TSome<T> => option.nonEmpty();
