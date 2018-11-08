import { map } from 'rxjs/operators';
import { getFormFileStateId } from '../../file-state-type-transformers';
import { UploaderEpic } from '../../helpers/redux-observable';
import { runListEpics } from '../../helpers/runListEpics';
import { FormUploaderState } from '../types';
import { formFileStateEpic } from '../FormFileState/epic';
import { getFormFileState } from '../UploaderState/reducer';

export const formUploaderStateEpic: UploaderEpic<FormUploaderState> = (action$, state$) => {
  const fileStates$ = state$.pipe(map(({ fileStates }) => fileStates));
  const fileStatesAction$ = fileStates$.pipe(
    runListEpics({
      action$,
      listItemEpic: formFileStateEpic,
      getListItemKey: getFormFileStateId,
      selectListItem: getFormFileState,
    }),
  );
  return fileStatesAction$;
};
