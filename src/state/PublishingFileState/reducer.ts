import { ReducerWithoutInitial } from '../../helpers/redux-types';
import { PublishingFileState } from '../types';
import { PublishingInProgressFileAction } from '../uploader-action';

export const publishingFileStateReducer: ReducerWithoutInitial<
  PublishingFileState,
  PublishingInProgressFileAction
> = (prevState, action) =>
  PublishingInProgressFileAction.match({
    UpdateFilePublishRequest: ({ publishRequest }) => ({
      ...prevState,
      currentState: {
        ...prevState.currentState,
        publishRequest,
      },
    }),
  })(action);
