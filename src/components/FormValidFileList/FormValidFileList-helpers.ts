import pipe from 'lodash/flow';
import { getMainRemoteDataForValidFile } from '../../file-state-type-transformers';
import * as remoteData from '../../helpers/remote-data';
import { FormValidFileState } from '../../state/types';

const checkFileStateHasRemoteDataFailure = pipe(
  (fileState: FormValidFileState) => fileState.currentState,
  getMainRemoteDataForValidFile,
  remoteData.checkIsFailure,
);
export const checkFileStatesHasRemoteDataFailure = (fileStates: FormValidFileState[]) => {
  const fileStatesHasRemoteDataFailure = fileStates.some(checkFileStateHasRemoteDataFailure);
  return fileStatesHasRemoteDataFailure;
};
