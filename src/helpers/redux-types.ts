import { Action, AnyAction } from 'redux';

export type ReducerWithoutInitial<S = any, A extends Action = AnyAction> = (
  state: S,
  action: A,
) => S;
