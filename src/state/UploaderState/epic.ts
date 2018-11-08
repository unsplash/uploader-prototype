import { Option } from 'funfix-core';
import { EMPTY } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { filterMap } from '../../helpers/observable-option';
import { getStateObservable, UploaderEpic } from '../../helpers/redux-observable';
import { UploaderState } from '../types';
import { formUploaderStateEpic } from '../FormUploaderState/epic';
import { publishingInProgressUploaderStateEpic } from '../PublishingInProgressUploaderState/epic';

type UploaderStateEpic = UploaderEpic<UploaderState>;

const equalUploaderStateTags = (x: UploaderState, y: UploaderState) => x.tag === y.tag;

export const uploaderStateEpic: UploaderStateEpic = (action$, state$) => {
  const stateEntry$ = state$.pipe(distinctUntilChanged(equalUploaderStateTags));

  const getFormUploaderState = UploaderState.match(
    {
      Form: Option.some,
    },
    Option.none,
  );
  const getPublishingInProgressUploaderState = UploaderState.match(
    {
      PublishingInProgress: Option.some,
    },
    Option.none,
  );

  const uploaderStateAction$ = stateEntry$.pipe(
    switchMap(
      UploaderState.match({
        Form: formUploaderState => {
          const formUploaderState$ = getStateObservable(
            state$.pipe(filterMap(getFormUploaderState)),
            formUploaderState,
          );
          return formUploaderStateEpic(action$, formUploaderState$, {});
        },
        PublishingInProgress: publishingInProgressUploaderState => {
          const formUploaderState$ = getStateObservable(
            state$.pipe(filterMap(getPublishingInProgressUploaderState)),
            publishingInProgressUploaderState,
          );
          return publishingInProgressUploaderStateEpic(action$, formUploaderState$, {});
        },
        PublishingComplete: () => EMPTY,
      }),
    ),
  );

  const outAction$ = uploaderStateAction$;

  return outAction$;
};
