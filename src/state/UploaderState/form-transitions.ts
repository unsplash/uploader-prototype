import pipe from 'lodash/flow';
import reject from 'lodash/reject';
import size from 'lodash/size';
import take from 'lodash/take';
import { FILES_UPPER_LIMIT } from '../../constants';
import {
  filterFormValidFileStates,
  getFormUploadedFileStates,
  mapFileStateCurrentState,
} from '../../file-state-type-transformers';
import * as remoteData from '../../helpers/remote-data';
import {
  FormFileCurrentState,
  FormFileState,
  FormUploaderState,
  PublishingFileCurrentState,
  UploadedFileCurrentState,
  UploaderState,
} from '../types';
import { createInitialFormFileState } from '../FormFileState/reducer';
import { UploaderActionRecord } from '../uploader-action';
import { INITIAL_UPLOADER_STATE } from './constants';

const getRemainingFileCount = pipe(
  filterFormValidFileStates,
  size,
  length => FILES_UPPER_LIMIT - length,
);

export const addFilesTransition = (prevState: FormUploaderState) => ({
  files: filesToAdd,
}: UploaderActionRecord['AddFiles']) => {
  const remainingCountAfterLimit = getRemainingFileCount(prevState.fileStates);
  const filesToAddAfterLimit = take(filesToAdd, remainingCountAfterLimit);
  const filesToAddInitialStates = filesToAddAfterLimit.map(file =>
    createInitialFormFileState({ file }),
  );
  const updatedFileStates = prevState.fileStates.concat(filesToAddInitialStates);
  const updatedState = UploaderState.Form({
    ...prevState,
    fileStates: updatedFileStates,
  });
  return updatedState;
};

const removeFileStateById = (fileStates: FormFileState[], idToRemove: string) =>
  reject(fileStates, file => file.id === idToRemove);
export const removeFileTransition = (prevState: FormUploaderState) => ({
  id: fileIdToRemove,
}: UploaderActionRecord['RemoveFile']) => {
  const updatedFileStates = removeFileStateById(prevState.fileStates, fileIdToRemove);
  const updatedState = UploaderState.Form({
    ...prevState,
    fileStates: updatedFileStates,
  });
  return updatedState;
};

export const resetTransition = (_prevState: FormUploaderState) => (
  _action: UploaderActionRecord['Reset'],
) => INITIAL_UPLOADER_STATE;

export const hideFilesLimitWarningTransition = (prevState: FormUploaderState) => (
  _action: UploaderActionRecord['HideFilesLimitWarning'],
) =>
  UploaderState.Form({
    ...prevState,
    shouldHideFilesLimitWarning: true,
  });

const transitionUploadedFileStateToPublishing = mapFileStateCurrentState(
  (currentState: UploadedFileCurrentState): PublishingFileCurrentState => ({
    ...currentState,
    publishRequest: new remoteData.NotAsked(),
  }),
);
export const publishFilesTransition = (prevState: FormUploaderState) => (
  _action: UploaderActionRecord['PublishFiles'],
) => {
  const maybeUploadedFileStates = getFormUploadedFileStates(prevState);
  return maybeUploadedFileStates
    .map(uploadedFileStates => {
      const publishingFileStates = uploadedFileStates.map(transitionUploadedFileStateToPublishing);
      return UploaderState.PublishingInProgress({
        fileStates: publishingFileStates,
      });
    })
    .getOrElseL(() => UploaderState.Form(prevState));
};

const filterOutInvalidFileStates = (fileStates: FormFileState[]) =>
  reject(fileStates, fileState => FormFileCurrentState.is.Invalid(fileState.currentState));
export const clearInvalidFilesTransition = (prevState: FormUploaderState) => (
  _action: UploaderActionRecord['ClearInvalidFiles'],
) => {
  const updatedFileStates = filterOutInvalidFileStates(prevState.fileStates);
  return UploaderState.Form({
    ...prevState,
    fileStates: updatedFileStates,
  });
};
