import { mapFileStateCurrentState } from '../../file-state-type-transformers';
import * as remoteData from '../../helpers/remote-data';
import {
  FormFileCurrentState,
  FormValidFileCurrentState,
  PublishingCompleteUploaderState,
  PublishingRequestFailureFileCurrentState,
  UploaderState,
} from '../types';
import { UploaderActionRecord } from '../uploader-action';
import { createFormUploaderStateWithDefaults } from './helpers';

const rollbackPublishingRequestFailureFileStateToForm = mapFileStateCurrentState(
  (currentState: PublishingRequestFailureFileCurrentState) =>
    FormFileCurrentState.Valid(
      FormValidFileCurrentState.UploadingToS3({
        dimensions: currentState.dimensions,
        fetchPresignedUrlResponse: currentState.fetchPresignedUrlResponse,
        uploadToS3Request: new remoteData.Success(currentState.uploadToS3Response),
      }),
    ),
);

export const rollbackPublishingRequestFailuresToFormTransition = (
  prevState: PublishingCompleteUploaderState,
) => (_action: UploaderActionRecord['RollbackPublishingRequestFailuresToForm']) => {
  const publishingRequestFailureFileStates = PublishingCompleteUploaderState.match({
    AllFailed: ({ failureFileStates }) => failureFileStates,
    SomeFailed: ({ failureFileStates }) => failureFileStates,
    AllSucceeded: () => [],
  })(prevState);
  const formFileStates = publishingRequestFailureFileStates.map(
    rollbackPublishingRequestFailureFileStateToForm,
  );
  return UploaderState.Form(
    createFormUploaderStateWithDefaults({
      fileStates: formFileStates,
    }),
  );
};
