import * as remoteData from '../../helpers/remote-data';
import * as validation from '../../helpers/validation';
import { Dimensions } from '../../types/index';
import { FetchPresignedUrlResponse } from '../../types/requests';
import {
  FormFetchingDimensionsFileCurrentState,
  FormFileCurrentState,
  FormInvalidFileCurrentState,
  FormValidFileCurrentState,
  FormValidFileCurrentStateRecord,
} from '../types';
import { FormFileActionRecord } from '../uploader-action';
import { validate } from './validation';

const fetchedDimensionsTransition = (
  _fetchingDimensions: FormFetchingDimensionsFileCurrentState,
) => ({ dimensions, file }: { dimensions: Dimensions; file: File }) => {
  const validationValue = validate({ file, dimensions });
  switch (validationValue.type) {
    case validation.Types.Failure: {
      const validationErrors = validationValue.value;
      return FormFileCurrentState.Invalid(
        FormInvalidFileCurrentState.ValidationErrors(validationErrors),
      );
    }
    case validation.Types.Success:
      return FormFileCurrentState.Valid(
        FormValidFileCurrentState.FetchingPresignedUrl({
          dimensions,
          fetchPresignedUrlRequest: new remoteData.NotAsked(),
        }),
      );
  }
};

export const updatedFetchDimensionsRequestTransition = (file: File) => (
  fetchingDimensions: FormFetchingDimensionsFileCurrentState,
) => ({
  fetchDimensionsRequest: updatedFetchDimensionsRequest,
}: FormFileActionRecord['UpdateFileFetchDimensionsRequest']) => {
  switch (updatedFetchDimensionsRequest.type) {
    case remoteData.Types.Success: {
      const dimensions = updatedFetchDimensionsRequest.value;
      return fetchedDimensionsTransition(fetchingDimensions)({
        file,
        dimensions,
      });
    }
    case remoteData.Types.Failure: {
      const failureValue = updatedFetchDimensionsRequest.value;
      return FormFileCurrentState.Invalid(
        FormInvalidFileCurrentState.FetchDimensionsFailure({
          reason: failureValue,
        }),
      );
    }
    case remoteData.Types.Loading:
    case remoteData.Types.NotAsked:
    case remoteData.Types.Reloading:
      return FormFileCurrentState.FetchingDimensions({
        fetchDimensionsRequest: updatedFetchDimensionsRequest,
      });
  }
};

const fetchedPresignedUrlTransition = (
  fetchingPresignedUrl: FormValidFileCurrentStateRecord['FetchingPresignedUrl'],
) => (fetchPresignedUrlResponse: FetchPresignedUrlResponse) =>
  FormFileCurrentState.Valid(
    FormValidFileCurrentState.UploadingToS3({
      dimensions: fetchingPresignedUrl.dimensions,
      fetchPresignedUrlResponse,
      uploadToS3Request: new remoteData.NotAsked(),
    }),
  );

export const updateFetchPresignedUrlRequestTransition = (
  fetchingPresignedUrl: FormValidFileCurrentStateRecord['FetchingPresignedUrl'],
) => ({
  fetchPresignedUrlRequest: updatedFetchPresignedUrlRequest,
}: FormFileActionRecord['UpdateFileFetchPresignedUrlRequest']) => {
  switch (updatedFetchPresignedUrlRequest.type) {
    case remoteData.Types.Success: {
      const fetchPresignedUrlResponse = updatedFetchPresignedUrlRequest.value;
      return fetchedPresignedUrlTransition(fetchingPresignedUrl)(fetchPresignedUrlResponse);
    }
    case remoteData.Types.Failure:
    case remoteData.Types.Loading:
    case remoteData.Types.NotAsked:
    case remoteData.Types.Reloading:
      return FormFileCurrentState.Valid(
        FormValidFileCurrentState.FetchingPresignedUrl({
          dimensions: fetchingPresignedUrl.dimensions,
          fetchPresignedUrlRequest: updatedFetchPresignedUrlRequest,
        }),
      );
  }
};

export const updateUploadToS3RequestTransition = (
  uploadingToS3: FormValidFileCurrentStateRecord['UploadingToS3'],
) => ({
  uploadToS3Request: updatedUploadToS3Request,
}: FormFileActionRecord['UpdateFileUploadToS3Request']) =>
  FormFileCurrentState.Valid(
    FormValidFileCurrentState.UploadingToS3({
      ...uploadingToS3,
      uploadToS3Request: updatedUploadToS3Request,
    }),
  );
