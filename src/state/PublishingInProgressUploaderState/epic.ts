import { forkJoin, merge, timer } from 'rxjs';
import { map, take } from 'rxjs/operators';
import {
  getPublishingFileStateId,
  getPublishingRequestLoadedFileStates,
} from '../../file-state-type-transformers';
import { filterMap } from '../../helpers/observable-option';
import { UploaderEpic } from '../../helpers/redux-observable';
import { runListEpics } from '../../helpers/runListEpics';
import { PublishingInProgressUploaderState } from '../types';
import { publishingFileStateEpic } from '../PublishingFileState/epic';
import { UploaderAction } from '../uploader-action';
import { getPublishingFileState } from '../UploaderState/reducer';

const MINIMUM_PUBLISHING_IN_PROGRESS_VISIBLE_SECONDS = 3000;

export const publishingInProgressUploaderStateEpic: UploaderEpic<
  PublishingInProgressUploaderState
> = (action$, state$) => {
  const fileStates$ = state$.pipe(map(({ fileStates }) => fileStates));
  const fileStatesAction$ = fileStates$.pipe(
    runListEpics({
      action$,
      listItemEpic: publishingFileStateEpic,
      getListItemKey: getPublishingFileStateId,
      selectListItem: getPublishingFileState,
    }),
  );

  const publishingRequestLoadedFileStates$ = fileStates$.pipe(
    filterMap(getPublishingRequestLoadedFileStates),
  );
  const publishingCompleted$ = publishingRequestLoadedFileStates$.pipe(take(1));
  // We want to emit the action when all files have completed and the minimum visible time has
  // passed.
  const publishingCompletedActionSource$ = forkJoin(
    timer(MINIMUM_PUBLISHING_IN_PROGRESS_VISIBLE_SECONDS),
    publishingCompleted$,
  );
  const publishingCompletedAction$ = publishingCompletedActionSource$.pipe(
    map(() => UploaderAction.PublishingCompleted({})),
  );

  return merge(fileStatesAction$, publishingCompletedAction$);
};
