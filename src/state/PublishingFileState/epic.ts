import { map } from 'rxjs/operators';
import {
  convertEpicWithInitialStateToEpic,
  UploaderEpicWithInitialState,
} from '../../helpers/redux-observable';
import { publishFromUploaded } from '../../requests';
import { PublishingFileState } from '../types';
import { PublishingInProgressFileAction } from '../uploader-action';

const _publishingFileStateEpic: UploaderEpicWithInitialState<PublishingFileState> = (
  _action$,
  state,
) => {
  const { id } = state;
  const publishRequest$ = publishFromUploaded(state);
  const publishRequestUpdateAction$ = publishRequest$.pipe(
    map(publishRequest =>
      PublishingInProgressFileAction.UpdateFilePublishRequest({ id, publishRequest }),
    ),
  );
  return publishRequestUpdateAction$;
};
export const publishingFileStateEpic = convertEpicWithInitialStateToEpic(_publishingFileStateEpic);
