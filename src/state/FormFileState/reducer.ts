import uuid from 'uuid';
import { mergeObjects } from '../../helpers/object';
import { transformOneState } from '../../helpers/reducers';
import { ReducerWithoutInitial } from '../../helpers/redux-types';
import * as remoteData from '../../helpers/remote-data';
import {
  FormFileCurrentState,
  FormFileState,
  FormValidFileCurrentState,
  FormValidFileCurrentStateRecord,
  FormValidFileCurrentStateTag,
} from '../types';
import { FormFileAction } from '../uploader-action';
import {
  updatedFetchDimensionsRequestTransition,
  updateFetchPresignedUrlRequestTransition,
  updateUploadToS3RequestTransition,
} from './transitions';

const initialFormFileCurrentState = FormFileCurrentState.FetchingDimensions({
  fetchDimensionsRequest: new remoteData.NotAsked(),
});

export const createInitialFormFileState = ({ file }: { file: File }): FormFileState => ({
  id: uuid(),
  file,
  currentState: initialFormFileCurrentState,
});

const applyOnState = transformOneState(FormFileCurrentState);
const applyOnFetchingDimensionsState = applyOnState('FetchingDimensions');

const transformOneValidState = <S extends FormValidFileCurrentStateTag>(stateType: S) => <Result>(
  fn: (prevState: FormValidFileCurrentStateRecord[S]) => Result,
  prevState: FormFileCurrentState,
) =>
  FormFileCurrentState.is.Valid(prevState) &&
  FormValidFileCurrentState.is[stateType](prevState.value)
    ? fn(prevState.value.value)
    : () => prevState;

const applyOnValidFetchingPresignedUrlState = transformOneValidState('FetchingPresignedUrl');
const applyOnValidUploadingToS3State = transformOneValidState('UploadingToS3');

//
// Reducers
//
const formFileCurrentStateReducer = (
  file: File,
): ReducerWithoutInitial<FormFileCurrentState, FormFileAction> => (prevState, action) =>
  FormFileAction.match(
    {
      UpdateFileFetchDimensionsRequest: applyOnFetchingDimensionsState(
        updatedFetchDimensionsRequestTransition(file),
        prevState,
      ),
      UpdateFileFetchPresignedUrlRequest: applyOnValidFetchingPresignedUrlState(
        updateFetchPresignedUrlRequestTransition,
        prevState,
      ),
      UpdateFileUploadToS3Request: applyOnValidUploadingToS3State(
        updateUploadToS3RequestTransition,
        prevState,
      ),
    },
    () => prevState,
  )(action);

export const formFileStateReducer: ReducerWithoutInitial<FormFileState, FormFileAction> = (
  prevState,
  action,
) => {
  const prevCurrentState = prevState.currentState;
  const updatedCurrentState = formFileCurrentStateReducer(prevState.file)(prevCurrentState, action);

  const mergeState = mergeObjects(prevState);

  // Only re-wrap if necessary, otherwise preserve reference identity.
  return updatedCurrentState !== prevCurrentState
    ? mergeState({
        currentState: updatedCurrentState,
      })
    : prevState;
};
