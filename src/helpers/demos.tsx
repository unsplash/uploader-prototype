import b64toBlob from 'b64-to-blob';
import { Option } from 'funfix-core';
import React, { SFC } from 'react';
import uuid from 'uuid';
import { IMAGE_JPEG_TYPE } from '../constants';
import {
  FetchDimensionsFailure,
  FileStateWith,
  FileValidationError,
  FormFileCurrentState,
  FormInvalidFileCurrentState,
  FormValidFileCurrentState,
  PublishedFileCurrentState,
  PublishingCompleteUploaderState,
  PublishingFileCurrentState,
  PublishingInProgressUploaderState,
  PublishingRequestFailureFileCurrentState,
  UploadedFileCurrentState,
} from '../state/types';
import { Dimensions } from '../types/index';
import { FetchPresignedUrlResponse, PublishResponse, UploadToS3Response } from '../types/requests';
import * as remoteData from './remote-data';

const mockDimensions: Dimensions = { width: 300, height: 300 };
const mockFetchPresignedUrlResponse: FetchPresignedUrlResponse = {
  presigned_url: 'foo',
};
const mockUploadToS3Response: UploadToS3Response = {};
const mockPublishResponse: PublishResponse = { id: 'foobarbaz' };

const mockUploaded: UploadedFileCurrentState = {
  dimensions: mockDimensions,
  fetchPresignedUrlResponse: mockFetchPresignedUrlResponse,
  uploadToS3Response: mockUploadToS3Response,
};

const mockBlob = b64toBlob(
  // Black 1x1 pixel
  'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
  IMAGE_JPEG_TYPE,
);
const mockFile = new File([mockBlob], 'filename');

const createFileState = <CurrentState extends {}>(
  currentState: CurrentState,
): FileStateWith<CurrentState> => ({
  id: uuid(),
  file: mockFile,
  currentState,
});

export const createFormFileStateValidAndUploading = () =>
  createFileState<FormFileCurrentState>(
    FormFileCurrentState.Valid(
      FormValidFileCurrentState.UploadingToS3({
        dimensions: mockDimensions,
        fetchPresignedUrlResponse: mockFetchPresignedUrlResponse,
        uploadToS3Request: new remoteData.Loading(
          Option.some({
            progress: {
              loaded: mockFile.size / 2,
            },
          }),
        ),
      }),
    ),
  );

export const createFormFileStateValidAndFailure = () =>
  createFileState<FormFileCurrentState>(
    FormFileCurrentState.Valid(
      FormValidFileCurrentState.UploadingToS3({
        dimensions: mockDimensions,
        fetchPresignedUrlResponse: mockFetchPresignedUrlResponse,
        uploadToS3Request: new remoteData.Failure('Something went wrong.'),
      }),
    ),
  );

export const createFormFileStateValidAndUploaded = () =>
  createFileState<FormFileCurrentState>(
    FormFileCurrentState.Valid(
      FormValidFileCurrentState.UploadingToS3({
        dimensions: mockDimensions,
        fetchPresignedUrlResponse: mockFetchPresignedUrlResponse,
        uploadToS3Request: new remoteData.Success({}),
      }),
    ),
  );
export const createFormFileStateInvalidWithValidationErrors = (
  validationErrors: FileValidationError[],
) =>
  createFileState<FormFileCurrentState>(
    FormFileCurrentState.Invalid(FormInvalidFileCurrentState.ValidationErrors(validationErrors)),
  );

export const createFormFileStateInvalidWithFetchDimensionsFailure = (
  fetchDimensionsFailure: FetchDimensionsFailure,
) =>
  createFileState<FormFileCurrentState>(
    FormFileCurrentState.Invalid(
      FormInvalidFileCurrentState.FetchDimensionsFailure(fetchDimensionsFailure),
    ),
  );

export const createPublishingFileStateLoading = () =>
  createFileState<PublishingFileCurrentState>({
    ...mockUploaded,
    publishRequest: new remoteData.Loading(),
  });
export const createPublishingFileStatePublished = () =>
  createFileState<PublishedFileCurrentState>({
    ...mockUploaded,
    publishResponse: mockPublishResponse,
  });
export const createPublishingFileStateFailure = () =>
  createFileState<PublishingRequestFailureFileCurrentState>({
    ...mockUploaded,
    publishRequestFailure: 'Something went wrong.',
  });

export const DemoWrapper: SFC<{}> = ({ children }) => (
  <div style={{ border: '1px solid', padding: '10px', maxWidth: '600px' }}>{children}</div>
);

export const createPublishingInProgressUploaderState = (
  publishingInProgressUploaderState: PublishingInProgressUploaderState,
): PublishingInProgressUploaderState => publishingInProgressUploaderState;

export const createPublishingCompleteUploaderState = (
  publishingCompleteUploaderState: PublishingCompleteUploaderState,
): PublishingCompleteUploaderState => publishingCompleteUploaderState;
