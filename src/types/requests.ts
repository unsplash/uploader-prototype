import * as remoteData from '../helpers/remote-data';
import { DenormalizedPhotoWithFullInfo, Dimensions } from './index';

import RemoteData = remoteData.RemoteData;

export type FetchPresignedUrlResponse = {
  presigned_url: string;
};
export type FetchDimensionsRequest = RemoteData<string, Dimensions>;
export type FetchPresignedUrlRequest = RemoteData<string, FetchPresignedUrlResponse>;
export type UploadToS3Response = {};
export type UploadToS3Request = RemoteData<string, UploadToS3Response>;
export type PublishRequestFailure = string;
export type PublishResponse = DenormalizedPhotoWithFullInfo;
export type PublishRequest = RemoteData<PublishRequestFailure, PublishResponse>;
export type PublishRequestLoaded = remoteData.Loaded<PublishRequestFailure, PublishResponse>;
