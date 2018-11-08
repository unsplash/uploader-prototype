import negate from 'lodash/negate';
import { ACCEPTED_FILE_TYPES } from '../../constants';
import {
  filterFormFetchingDimensionsFileStates,
  filterFormInvalidFileStates,
  filterFormValidFileStates,
} from '../../file-state-type-transformers';
import {
  checkCanAddFiles,
  checkCanPublishFiles,
} from '../../state/UploaderState/transition-guards';
import {
  FormFetchingDimensionsFileState,
  FormInvalidFileState,
  FormUploaderState,
  FormValidFileState,
} from '../../state/types';

export const FILE_INPUT_ACCEPT = ACCEPTED_FILE_TYPES.join(',');

export const checkShouldDisableFormSubmit = negate(checkCanPublishFiles);

export const checkShouldDisableFileInput = negate(checkCanAddFiles);

type FormGroupedFileStates = {
  fetchingDimensions: FormFetchingDimensionsFileState[];
  invalid: FormInvalidFileState[];
  valid: FormValidFileState[];
};

export const deriveGroupedFileStates = (
  uploaderState: FormUploaderState,
): FormGroupedFileStates => {
  const { fileStates } = uploaderState;

  const fetchingDimensions = filterFormFetchingDimensionsFileStates(fileStates);
  const invalid = filterFormInvalidFileStates(fileStates);
  const valid = filterFormValidFileStates(fileStates);

  return {
    fetchingDimensions,
    invalid,
    valid,
  };
};
