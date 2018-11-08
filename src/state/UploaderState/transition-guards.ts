import pipe from 'lodash/flow';
import negate from 'lodash/negate';
import size from 'lodash/size';
import { FILES_UPPER_LIMIT } from '../../constants';
import {
  filterFormValidFileStates,
  getFormUploadedFileStates,
} from '../../file-state-type-transformers';
import { isOptionSome } from '../../helpers/option';
import { FormFileState, FormUploaderState } from '../types';

const checkIsSizeGreaterThan0 = pipe(
  size,
  n => n > 0,
);

const checkHasHitFilesLimit = ({ fileStates }: { fileStates: FormFileState[] }) =>
  fileStates.length >= FILES_UPPER_LIMIT;

export const checkShouldShowFilesLimitWarning = ({
  shouldHideFilesLimitWarning,
  fileStates,
}: FormUploaderState) => !shouldHideFilesLimitWarning && checkHasHitFilesLimit({ fileStates });

export const checkCanAddFiles = negate(checkHasHitFilesLimit);

const checkAreAllFilesUploaded = pipe(
  getFormUploadedFileStates,
  isOptionSome,
);

const checkHasValidFiles = pipe(
  filterFormValidFileStates,
  checkIsSizeGreaterThan0,
);

const checkHasValidFilesAndAllFilesUploaded = (formUploaderState: FormUploaderState) =>
  checkHasValidFiles(formUploaderState.fileStates) && checkAreAllFilesUploaded(formUploaderState);

// Publishing is only possible when the form has valid files and all files are in an uploaded state.
export const checkCanPublishFiles = checkHasValidFilesAndAllFilesUploaded;
