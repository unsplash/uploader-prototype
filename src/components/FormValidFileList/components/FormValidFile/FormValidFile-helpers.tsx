import pipe from 'lodash/flow';
import { getMainRemoteDataForValidFile } from '../../../../file-state-type-transformers';
import * as remoteData from '../../../../helpers/remote-data';
import { FormValidFileCurrentState } from '../../../../state/types';

const REMOVE_BUTTON_TEXT_CANCEL = 'Cancel';
const REMOVE_BUTTON_TEXT_REMOVE = 'Remove';
const getRemoveButtonTextForRequest = <E, A>(request: remoteData.RemoteData<E, A>) =>
  remoteData.checkIsLoading(request) ? REMOVE_BUTTON_TEXT_CANCEL : REMOVE_BUTTON_TEXT_REMOVE;
export const getRemoveButtonText = pipe(
  getMainRemoteDataForValidFile,
  getRemoveButtonTextForRequest,
);

export const getDimensions = FormValidFileCurrentState.match({
  FetchingPresignedUrl: fetchingPresignedUrl => fetchingPresignedUrl.dimensions,
  UploadingToS3: uploadingToS3 => uploadingToS3.dimensions,
});
