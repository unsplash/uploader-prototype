import { Option } from 'funfix-core';
import pipe from 'lodash/flow';
import { filterMap, traverseOptions } from './helpers/array-option';
import * as remoteData from './helpers/remote-data';
import {
  FileStateWith,
  FormFileCurrentState,
  FormFileCurrentStateRecord,
  FormFileCurrentStateTag,
  FormFileState,
  FormUploaderState,
  FormValidFileCurrentState,
  PublishedFileCurrentState,
  PublishingCompleteUploaderState,
  PublishingFileCurrentState,
  PublishingFileState,
  PublishingRequestFailureFileCurrentState,
  PublishingRequestLoadedFileCurrentState,
  UploadedFileCurrentState,
} from './state/types';
import { PublishRequestFailure, PublishResponse } from "./types/requests";

export const mapFileStateCurrentState = <A, B>(fn: (currentState: A) => B) => (
  fileState: FileStateWith<A>,
): FileStateWith<B> => ({
  ...fileState,
  currentState: fn(fileState.currentState),
});

const invertFileStateMaybeCurrentState = <A>(
  fileStateWith: FileStateWith<Option<A>>,
): Option<FileStateWith<A>> =>
  fileStateWith.currentState.map(b => ({
    ...fileStateWith,
    currentState: b,
  }));

const mapFileStateCurrentStateMaybe = <A, B>(fn: (currentState: A) => Option<B>) =>
  pipe(
    mapFileStateCurrentState(fn),
    invertFileStateMaybeCurrentState,
  );

const getFormFileCurrentStateOption = <A extends FormFileCurrentStateTag>(tag: A) => (
  currentState: FormFileCurrentState,
): Option<FormFileCurrentStateRecord[A]> =>
  FormFileCurrentState.is[tag](currentState) ? Option.some(currentState.value) : Option.none();

const getFormFileStateOption = <A extends FormFileCurrentStateTag>(tag: A) =>
  pipe(
    () => getFormFileCurrentStateOption(tag),
    mapFileStateCurrentStateMaybe,
  )();

export const filterFormFetchingDimensionsFileStates = filterMap(
  getFormFileStateOption('FetchingDimensions'),
);
export const filterFormInvalidFileStates = filterMap(getFormFileStateOption('Invalid'));
export const filterFormValidFileStates = filterMap(getFormFileStateOption('Valid'));

const getFormUploadedFileState = mapFileStateCurrentStateMaybe(
  FormValidFileCurrentState.match(
    {
      UploadingToS3: uploadingToS3 => {
        const maybeUploadToS3Response = remoteData.getSuccessValue(uploadingToS3.uploadToS3Request);
        return maybeUploadToS3Response.map(
          (uploadToS3Response): UploadedFileCurrentState => ({
            dimensions: uploadingToS3.dimensions,
            fetchPresignedUrlResponse: uploadingToS3.fetchPresignedUrlResponse,
            uploadToS3Response,
          }),
        );
      },
    },
    () => Option.none(),
  ),
);
// If all files are uploaded, return all. Otherwise return none.
export const getFormUploadedFileStates = ({ fileStates }: FormUploaderState) =>
  pipe(
    filterFormValidFileStates,
    traverseOptions(getFormUploadedFileState),
  )(fileStates);

const getPublishingRequestLoadedFileState = mapFileStateCurrentStateMaybe(
  (currentState: PublishingFileCurrentState): Option<PublishingRequestLoadedFileCurrentState> => {
    const maybePublishRequestLoaded = remoteData.getLoaded(currentState.publishRequest);
    const maybePublishingRequestLoadedFileCurrentState = maybePublishRequestLoaded.map(
      publishRequestLoaded => ({
        dimensions: currentState.dimensions,
        fetchPresignedUrlResponse: currentState.fetchPresignedUrlResponse,
        uploadToS3Response: currentState.uploadToS3Response,
        publishRequestLoaded,
      }),
    );
    return maybePublishingRequestLoadedFileCurrentState;
  },
);
// If all requests are loaded, return all. Otherwise return none.
export const getPublishingRequestLoadedFileStates = traverseOptions(
  getPublishingRequestLoadedFileState,
);

export const derivePublishingCompleteUploaderState = (
  publishingFileStates: PublishingFileState[],
): Option<PublishingCompleteUploaderState> => {
  const maybeRequestLoadedFileStates = getPublishingRequestLoadedFileStates(publishingFileStates);
  return maybeRequestLoadedFileStates.map(
    (fileStates): PublishingCompleteUploaderState => {
      const failureFileStates = filterPublishingRequestFailureFileStates(fileStates);
      if (failureFileStates.length === fileStates.length) {
        return PublishingCompleteUploaderState.AllFailed({
          failureFileStates,
        });
      } else {
        const successFileStates = filterPublishedFileStates(fileStates);
        if (failureFileStates.length > 0) {
          return PublishingCompleteUploaderState.SomeFailed({
            failureFileStates,
            successFileStates,
          });
        } else {
          return PublishingCompleteUploaderState.AllSucceeded({
            successFileStates,
          });
        }
      }
    },
  );
};

const getPublishingRequestFailureFileState = mapFileStateCurrentStateMaybe(
  (
    currentState: PublishingRequestLoadedFileCurrentState,
  ): Option<PublishingRequestFailureFileCurrentState> => {
    // Generic inference fails here due to a potential TS bug/limitation, so we pass generics
    // explicitly. https://github.com/Microsoft/TypeScript/issues/26773
    const maybePublishRequestFailure = remoteData.getFailureValue<
      PublishRequestFailure,
      PublishResponse
    >(currentState.publishRequestLoaded);
    const maybePublishingRequestFailureFileCurrentState = maybePublishRequestFailure.map(
      (publishRequestFailure): PublishingRequestFailureFileCurrentState => ({
        dimensions: currentState.dimensions,
        fetchPresignedUrlResponse: currentState.fetchPresignedUrlResponse,
        uploadToS3Response: currentState.uploadToS3Response,
        publishRequestFailure,
      }),
    );
    return maybePublishingRequestFailureFileCurrentState;
  },
);
const filterPublishingRequestFailureFileStates = filterMap(getPublishingRequestFailureFileState);

const getPublishedFileState = mapFileStateCurrentStateMaybe(
  (currentState: PublishingRequestLoadedFileCurrentState): Option<PublishedFileCurrentState> => {
    // Generic inference fails here due to a potential TS bug/limitation, so we pass generics
    // explicitly. https://github.com/Microsoft/TypeScript/issues/26773
    const maybePublishResponse = remoteData.getSuccessValue<PublishRequestFailure, PublishResponse>(
      currentState.publishRequestLoaded,
    );
    const maybePublishedFileCurrentState = maybePublishResponse.map(
      (publishResponse): PublishedFileCurrentState => ({
        dimensions: currentState.dimensions,
        fetchPresignedUrlResponse: currentState.fetchPresignedUrlResponse,
        uploadToS3Response: currentState.uploadToS3Response,
        publishResponse,
      }),
    );
    return maybePublishedFileCurrentState;
  },
);
const filterPublishedFileStates = filterMap(getPublishedFileState);

export const getMainRemoteDataForValidFile = FormValidFileCurrentState.match({
  FetchingPresignedUrl: ({ fetchPresignedUrlRequest }) => fetchPresignedUrlRequest,
  UploadingToS3: ({ uploadToS3Request }) => uploadToS3Request,
});

export const getFormFileStateId = (fileState: FormFileState) => fileState.id;
export const getPublishingFileStateId = (fileState: PublishingFileState) => fileState.id;
