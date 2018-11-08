import { ofType, unionize } from 'unionize';
import { unionizeSafe } from '../helpers/unionize';
import { Validation } from '../helpers/validation';
import { Dimensions } from '../types/index';
import {
  FetchDimensionsRequest,
  FetchPresignedUrlRequest,
  FetchPresignedUrlResponse,
  PublishRequest,
  PublishRequestFailure,
  PublishRequestLoaded,
  PublishResponse,
  UploadToS3Request,
  UploadToS3Response,
} from '../types/requests';

export const FileValidationError = unionize({
  InsufficientMegapixels: ofType<{}>(),
  InvalidFileType: ofType<{}>(),
  ExceedsMaximumFileSize: ofType<{}>(),
});
export type FileValidationError = typeof FileValidationError._Union;

export type FileValidation = Validation<FileValidationError>;

export type FileAndPresignedUrl = { presignedUrl: string; file: File };

export type FormFetchingDimensionsFileCurrentState = {
  fetchDimensionsRequest: FetchDimensionsRequest;
};

export type FetchDimensionsFailure = { reason: string };

export const FormInvalidFileCurrentState = unionizeSafe({
  // Validation ran but did not pass.
  ValidationErrors: ofType<FileValidationError[]>(),
  FetchDimensionsFailure: ofType<FetchDimensionsFailure>(),
});
export type FormInvalidFileCurrentState = typeof FormInvalidFileCurrentState._Union;

export const FormValidFileCurrentState = unionizeSafe({
  FetchingPresignedUrl: ofType<{
    dimensions: Dimensions;
    fetchPresignedUrlRequest: FetchPresignedUrlRequest;
  }>(),
  UploadingToS3: ofType<{
    dimensions: Dimensions;
    fetchPresignedUrlResponse: FetchPresignedUrlResponse;
    uploadToS3Request: UploadToS3Request;
  }>(),
});
export type FormValidFileCurrentState = typeof FormValidFileCurrentState._Union;
export type FormValidFileCurrentStateRecord = typeof FormValidFileCurrentState._Record;
export type FormValidFileCurrentStateTag = typeof FormValidFileCurrentState._Tags;

export type UploadedFileCurrentState = {
  dimensions: Dimensions;
  fetchPresignedUrlResponse: FetchPresignedUrlResponse;
  uploadToS3Response: UploadToS3Response;
};

export type PublishingFileCurrentState = UploadedFileCurrentState & {
  publishRequest: PublishRequest;
};

export type PublishingRequestLoadedFileCurrentState = UploadedFileCurrentState & {
  publishRequestLoaded: PublishRequestLoaded;
};

export type PublishingRequestFailureFileCurrentState = UploadedFileCurrentState & {
  publishRequestFailure: PublishRequestFailure;
};

export type PublishedFileCurrentState = UploadedFileCurrentState & {
  publishResponse: PublishResponse;
};

export const FormFileCurrentState = unionizeSafe({
  FetchingDimensions: ofType<FormFetchingDimensionsFileCurrentState>(),
  Invalid: ofType<FormInvalidFileCurrentState>(),
  Valid: ofType<FormValidFileCurrentState>(),
});
export type FormFileCurrentState = typeof FormFileCurrentState._Union;
export type FormFileCurrentStateRecord = typeof FormFileCurrentState._Record;
export type FormFileCurrentStateTag = typeof FormFileCurrentState._Tags;

export type FileWithId = {
  id: string;
  // TODO: this is not serialisable
  file: File;
};

export type FileStateWith<FileCurrentState> = FileWithId & {
  currentState: FileCurrentState;
};

export type FormFetchingDimensionsFileState = FileStateWith<FormFetchingDimensionsFileCurrentState>;
export type FormInvalidFileState = FileStateWith<FormInvalidFileCurrentState>;
export type FormValidFileState = FileStateWith<FormValidFileCurrentState>;

export type PublishingFileState = FileStateWith<PublishingFileCurrentState>;
export type PublishingRequestFailureFileState = FileStateWith<
  PublishingRequestFailureFileCurrentState
>;
export type PublishedFileState = FileStateWith<PublishedFileCurrentState>;

export type FormFileState = FileStateWith<FormFileCurrentState>;

export type FormUploaderState = {
  shouldHideFilesLimitWarning: boolean;
  fileStates: FormFileState[];
};

export const PublishingCompleteUploaderState = unionizeSafe({
  AllFailed: ofType<{
    failureFileStates: PublishingRequestFailureFileState[];
  }>(),
  SomeFailed: ofType<{
    failureFileStates: PublishingRequestFailureFileState[];
    successFileStates: PublishedFileState[];
  }>(),
  AllSucceeded: ofType<{
    successFileStates: PublishedFileState[];
  }>(),
});
export type PublishingCompleteUploaderState = typeof PublishingCompleteUploaderState._Union;

export type PublishingInProgressUploaderState = {
  fileStates: PublishingFileState[];
};

export const UploaderState = unionizeSafe({
  Form: ofType<FormUploaderState>(),
  PublishingInProgress: ofType<PublishingInProgressUploaderState>(),
  PublishingComplete: ofType<PublishingCompleteUploaderState>(),
});
export type UploaderState = typeof UploaderState._Union;
