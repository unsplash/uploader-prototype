import { Option } from 'funfix-core';
import { Reducer } from 'redux';
import {
  derivePublishingCompleteUploaderState,
  getFormFileStateId,
  getPublishingFileStateId,
} from '../../file-state-type-transformers';
import { transformOneState } from '../../helpers/reducers';
import {
  FormFileState,
  FormUploaderState,
  PublishingFileState,
  PublishingInProgressUploaderState,
  UploaderState,
} from '../types';
import { formFileStateReducer } from '../FormFileState/reducer';
import { publishingFileStateReducer } from '../PublishingFileState/reducer';
import {
  AllUploaderAction,
  FormFileAction,
  PublishingInProgressFileAction,
  UploaderAction,
} from '../uploader-action';
import { INITIAL_UPLOADER_STATE } from './constants';
import {
  addFilesTransition,
  clearInvalidFilesTransition,
  hideFilesLimitWarningTransition,
  publishFilesTransition,
  removeFileTransition,
  resetTransition,
} from './form-transitions';
import { rollbackPublishingRequestFailuresToFormTransition } from './publishing-transitions';

const applyOnState = transformOneState(UploaderState);

const applyOnFormState = applyOnState('Form');
const applyOnPublishingInProgressState = applyOnState('PublishingInProgress');
const applyOnPublishingCompleteState = applyOnState('PublishingComplete');

const formFileTransition = (prevState: FormUploaderState) => (action: FormFileAction) =>
  UploaderState.Form({
    ...prevState,
    fileStates: prevState.fileStates.map(
      prevFileState =>
        prevFileState.id === action.value.id
          ? formFileStateReducer(prevFileState, action)
          : prevFileState,
    ),
  });

const publishingInProgressFileTransition = (prevState: PublishingInProgressUploaderState) => (
  action: PublishingInProgressFileAction,
) =>
  UploaderState.PublishingInProgress({
    fileStates: prevState.fileStates.map(
      prevFileState =>
        prevFileState.id === action.value.id
          ? publishingFileStateReducer(prevFileState, action)
          : prevFileState,
    ),
  });

export const uploaderStateReducer: Reducer<UploaderState, AllUploaderAction> = (
  prevState = INITIAL_UPLOADER_STATE,
  action,
) =>
  AllUploaderAction.match(
    {
      Uploader: UploaderAction.match(
        {
          AddFiles: applyOnFormState(addFilesTransition, prevState),
          RemoveFile: applyOnFormState(removeFileTransition, prevState),
          Reset: applyOnFormState(resetTransition, prevState),
          HideFilesLimitWarning: applyOnFormState(hideFilesLimitWarningTransition, prevState),
          PublishFiles: applyOnFormState(publishFilesTransition, prevState),
          ClearInvalidFiles: applyOnFormState(clearInvalidFilesTransition, prevState),
          PublishingCompleted: () =>
            UploaderState.is.PublishingInProgress(prevState)
              ? derivePublishingCompleteUploaderState(prevState.value.fileStates)
                  .map(UploaderState.PublishingComplete)
                  .getOrElse(prevState)
              : prevState,
          RollbackPublishingRequestFailuresToForm: applyOnPublishingCompleteState(
            rollbackPublishingRequestFailuresToFormTransition,
            prevState,
          ),
        },
        () => prevState,
      ),
      FormFile: applyOnFormState(formFileTransition, prevState),
      PublishingInProgressFile: applyOnPublishingInProgressState(
        publishingInProgressFileTransition,
        prevState,
      ),
    },
    // this catches all non-AllUploaderAction actions
    () => prevState,
  )(action);

//
// Selectors
//

export const getFormFileState = (id: string) => (states: FormFileState[]) =>
  Option.of(states.find(file => getFormFileStateId(file) === id));

export const getPublishingFileState = (id: string) => (states: PublishingFileState[]) =>
  Option.of(states.find(file => getPublishingFileStateId(file) === id));
