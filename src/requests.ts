import { Option } from 'funfix-core';
import { Observable } from 'rxjs';
import * as urlHelpers from 'url';
import { ajaxUsingRemoteData } from './helpers/observable-remote-data';
import { FileAndPresignedUrl, FileStateWith, UploadedFileCurrentState } from './state/types';
import {
  FetchPresignedUrlRequest,
  FetchPresignedUrlResponse,
  PublishRequest,
  PublishResponse,
  UploadToS3Request,
  UploadToS3Response,
} from './types/requests';

enum Method {
  POST = 'POST',
  PUT = 'PUT',
}

const API_ORIGIN = 'https://httpbin.org';

const API_PATHNAME_GET_PRESIGNED_URL = '/get';
const API_URL_GET_PRESIGNED_URL = urlHelpers.resolve(API_ORIGIN, API_PATHNAME_GET_PRESIGNED_URL);

const API_PATHNAME_POST_PHOTO = '/post';
const API_URL_POST_PHOTO = urlHelpers.resolve(API_ORIGIN, API_PATHNAME_POST_PHOTO);

const EXAMPLE_FETCH_PRESIGNED_URL_RESPONSE: FetchPresignedUrlResponse = {
  presigned_url: urlHelpers.resolve(API_ORIGIN, '/put'),
};
const EXAMPLE_UPLOAD_TO_S3_RESPONSE: UploadToS3Response = {};
const EXAMPLE_PUBLISH_RESPONSE: PublishResponse = { id: 'example-id' };

// Pre-signed URLs
// https://docs.aws.amazon.com/AmazonS3/latest/dev/PresignedUrlUploadObject.html

export const fetchPresignedUrl = (): Observable<FetchPresignedUrlRequest> =>
  ajaxUsingRemoteData(
    {
      url: API_URL_GET_PRESIGNED_URL,
    },
    (_ajaxResponse): FetchPresignedUrlResponse => EXAMPLE_FETCH_PRESIGNED_URL_RESPONSE,
  );

// S3 put object
// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property

export const uploadToS3 = ({
  presignedUrl,
  file,
}: FileAndPresignedUrl): Observable<UploadToS3Request> =>
  ajaxUsingRemoteData(
    {
      url: presignedUrl,
      method: Method.PUT,
      // File extends the Blob type, which XHR (and thus RxJS ajax) natively supports in request
      // bodies.
      body: file,
      headers: {
        // Warning: header name is case sensitive due to RxJS bug
        // https://github.com/ReactiveX/rxjs/issues/2837
        'Content-Type': file.type,
      },
    },
    (_ajaxResponse): UploadToS3Response => EXAMPLE_UPLOAD_TO_S3_RESPONSE,
  );

// Publish photo

type PublishRequestBody = {
  photo: {
    filepath: string;
    filetype: string;
    filesize: number;
  };
};

type PublishParams = {
  photo: { file: { path: string; type: string; size: number } };
};
const publish = (params: PublishParams): Observable<PublishRequest> => {
  const body: PublishRequestBody = {
    photo: {
      filepath: params.photo.file.path,
      filetype: params.photo.file.type,
      filesize: params.photo.file.size,
    },
  };
  return ajaxUsingRemoteData(
    {
      url: API_URL_POST_PHOTO,
      method: Method.POST,
      body,
      headers: {
        // Warning: header name is case sensitive due to RxJS bug
        // https://github.com/ReactiveX/rxjs/issues/2837
        'Content-Type': 'application/json',
      },
    },
    (_ajaxResponse): PublishResponse => EXAMPLE_PUBLISH_RESPONSE,
  );
};

const getS3PhotoPathnameFromPresignedUrl = (presignedUrl: string) => {
  const parsedUrl = urlHelpers.parse(presignedUrl);
  return Option.of(parsedUrl.pathname).get();
};

export const publishFromUploaded = ({
  file,
  currentState: {
    fetchPresignedUrlResponse: { presigned_url: presignedUrl },
  },
}: FileStateWith<UploadedFileCurrentState>): Observable<PublishRequest> => {
  const s3PhotoPathname = getS3PhotoPathnameFromPresignedUrl(presignedUrl);
  const request$ = publish({
    photo: {
      file: {
        path: s3PhotoPathname,
        type: file.type,
        size: file.size,
      },
    },
  });
  return request$;
};
