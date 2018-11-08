import { ActionsObservable } from 'redux-observable';
import { EMPTY, pipe } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { mapFileStateCurrentState } from '../../file-state-type-transformers';
import { retryWhenForRemoteData } from '../../helpers/observable-remote-data';
import { UploaderEpic, UploaderEpicWithInitialState } from '../../helpers/redux-observable';
import * as remoteData from '../../helpers/remote-data';
import { fetchPresignedUrl, uploadToS3 } from '../../requests';
import {
  FileAndPresignedUrl,
  FileStateWith,
  FormFetchingDimensionsFileState,
  FormFileCurrentState,
  FormFileState,
  FormValidFileCurrentState,
  FormValidFileCurrentStateRecord,
} from '../types';
import { AllUploaderActionMap, FormFileAction, UploaderAction } from '../uploader-action';
import { fetchDimensions } from './epic-helpers';

const fetchingDimensionsEpic: UploaderEpicWithInitialState<FormFetchingDimensionsFileState> = (
  _action$,
  { id, file },
) => {
  const fetchDimensionsRequest$ = fetchDimensions(file);

  const fetchDimensionsRequestUpdateAction$ = fetchDimensionsRequest$.pipe(
    map(fetchDimensionsRequest =>
      FormFileAction.UpdateFileFetchDimensionsRequest({ id, fetchDimensionsRequest }),
    ),
  );

  return fetchDimensionsRequestUpdateAction$;
};

const fetchingPresignedUrlEpic: UploaderEpicWithInitialState<
  FileStateWith<FormValidFileCurrentStateRecord['FetchingPresignedUrl']>
> = (action$, { id }) => {
  const retry$ = action$.pipe(filter(UploaderAction.is.RetryFailedRequestsForValidFiles));
  const fetchPresignedUrlRequest$ = fetchPresignedUrl().pipe(retryWhenForRemoteData(retry$));
  const fetchPresignedUrlRequestUpdateAction$ = fetchPresignedUrlRequest$.pipe(
    map(fetchPresignedUrlRequest =>
      FormFileAction.UpdateFileFetchPresignedUrlRequest({
        id,
        fetchPresignedUrlRequest,
      }),
    ),
  );
  return fetchPresignedUrlRequestUpdateAction$;
};

const uploadingToS3Epic: UploaderEpicWithInitialState<
  FileStateWith<FormValidFileCurrentStateRecord['UploadingToS3']>
> = (action$, { id, file, currentState }) => {
  // When rolling back to this state, the request will already be completed.
  if (remoteData.checkIsNotAsked(currentState.uploadToS3Request)) {
    const retry$ = action$.pipe(filter(UploaderAction.is.RetryFailedRequestsForValidFiles));
    const fileAndPresignedUrl: FileAndPresignedUrl = {
      presignedUrl: currentState.fetchPresignedUrlResponse.presigned_url,
      file,
    };
    const uploadToS3Request$ = uploadToS3(fileAndPresignedUrl).pipe(retryWhenForRemoteData(retry$));
    const uploadToS3RequestUpdateAction$ = uploadToS3Request$.pipe(
      map(uploadToS3Request =>
        FormFileAction.UpdateFileUploadToS3Request({ id, uploadToS3Request }),
      ),
    );
    return uploadToS3RequestUpdateAction$;
  } else {
    return EMPTY;
  }
};

/**
 * We want to know when we've entered a new state in the `FormFileCurrentState` union, but
 * also when we enter a new state within `Valid`, i.e. in the `FormValidFileCurrentState` union.
 * That's why we compare the inner unions' tags when both `currentState` are `Valid`.
 */
const checkAreCurrentStatesEqual = (
  { currentState: x }: FormFileState,
  { currentState: y }: FormFileState,
) =>
  FormFileCurrentState.is.Valid(x) && FormFileCurrentState.is.Valid(y)
    ? x.value.tag === y.value.tag
    : x.tag === y.tag;

const callSubEpic = <A, B>(
  action$: ActionsObservable<AllUploaderActionMap>,
  state: FileStateWith<A>,
  epic: UploaderEpicWithInitialState<FileStateWith<B>>,
) =>
  pipe(
    (currentState: B) => mapFileStateCurrentState(() => currentState)(state),
    fileState => epic(action$, fileState),
  );

export const formFileStateEpic: UploaderEpic<FormFileState> = (action$, state$) =>
  state$.pipe(
    distinctUntilChanged(checkAreCurrentStatesEqual),
    switchMap(state =>
      FormFileCurrentState.match({
        FetchingDimensions: callSubEpic(action$, state, fetchingDimensionsEpic),
        Invalid: () => EMPTY,
        Valid: FormValidFileCurrentState.match({
          FetchingPresignedUrl: callSubEpic(action$, state, fetchingPresignedUrlEpic),
          UploadingToS3: callSubEpic(action$, state, uploadingToS3Epic),
        }),
      })(state.currentState),
    ),
  );
