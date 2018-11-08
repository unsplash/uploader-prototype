import { Action as ReduxAction } from 'redux';
import { ActionsObservable, Epic, StateObservable } from 'redux-observable';
import { Observable, Subject } from 'rxjs';
import { AllUploaderActionMap } from '../state/uploader-action';

export const getStateObservable = <State>(state$: Observable<State>, initialState: State) => {
  // `StateObservable`'s types ask for a `Subject`, but the code doesn't actually need
  // one. To avoid the hassle of converting our `Observable` to a `Subject`, we just cast
  // the type.
  // https://github.com/redux-observable/redux-observable/issues/570
  const stateSubject = state$ as Subject<State>;
  const stateStateObservable = new StateObservable(stateSubject, initialState);
  return stateStateObservable;
};

// Many times our epics only require the initial state. In this case, it's not worth the hassle of
// creating state observables. Thus, we use a variant of epics that only receive the initial state.
type EpicWithInitialState<A extends ReduxAction, S> = (
  action: ActionsObservable<A>,
  initialState: S,
) => Observable<A>;

export const convertEpicWithInitialStateToEpic = <A extends ReduxAction, S>(
  epic: EpicWithInitialState<A, S>,
): Epic<A, A, S> => (action$, state$) => {
  const initialState = state$.value;
  return epic(action$, initialState);
};

export type UploaderEpic<S> = Epic<AllUploaderActionMap, AllUploaderActionMap, S>;
export type UploaderEpicWithInitialState<S> = EpicWithInitialState<AllUploaderActionMap, S>;
