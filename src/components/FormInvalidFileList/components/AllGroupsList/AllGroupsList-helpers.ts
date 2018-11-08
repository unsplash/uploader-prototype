import { mergeObjects } from '../../../../helpers/object';
import {
  FileValidationError,
  FileWithId,
  FormInvalidFileCurrentState,
  FormInvalidFileState,
} from '../../../../state/types';

type Params = { fileStates: FormInvalidFileState[] };

type GroupFetchDimensionsFailure = Array<FileWithId>;
type GroupValidationErrors = Record<typeof FileValidationError._Tags, Array<FileWithId>>;
export type AllGroupsList = {
  FetchDimensionsFailure: GroupFetchDimensionsFailure;
  ValidationErrors: GroupValidationErrors;
};

const groupValidationErrorsReducer = (fileWithId: FileWithId) => (
  acc: GroupValidationErrors,
  validationError: FileValidationError,
): GroupValidationErrors => {
  const mergeWithAcc = mergeObjects(acc);
  return FileValidationError.match({
    ExceedsMaximumFileSize: _ =>
      mergeWithAcc({
        ExceedsMaximumFileSize: acc.ExceedsMaximumFileSize.concat(fileWithId),
      }),
    InsufficientMegapixels: _ =>
      mergeWithAcc({
        InsufficientMegapixels: acc.InsufficientMegapixels.concat(fileWithId),
      }),
    InvalidFileType: _ =>
      mergeWithAcc({
        InvalidFileType: acc.InvalidFileType.concat(fileWithId),
      }),
  })(validationError);
};

// Group the list of invalid files by their invalid file state
export const groupInvalidFiles = ({ fileStates }: Params): AllGroupsList => {
  const seed: AllGroupsList = {
    FetchDimensionsFailure: [],
    ValidationErrors: {
      InsufficientMegapixels: [],
      InvalidFileType: [],
      ExceedsMaximumFileSize: [],
    },
  };

  return fileStates.reduce((acc, fileState) => {
    const { id, file } = fileState;
    const fileWithId: FileWithId = { id, file };

    const mergeWithAcc = mergeObjects(acc);

    return FormInvalidFileCurrentState.match({
      FetchDimensionsFailure: _fetchDimensionsFailure =>
        mergeWithAcc({
          FetchDimensionsFailure: acc.FetchDimensionsFailure.concat(fileWithId),
        }),
      ValidationErrors: validationErrors =>
        mergeWithAcc({
          ValidationErrors: validationErrors.reduce(
            groupValidationErrorsReducer(fileWithId),
            acc.ValidationErrors,
          ),
        }),
    })(fileState.currentState);
  }, seed);
};

export const formatMegabytes = (megabytes: number) => `${megabytes} MB`;
export const formatMegapixels = (megapixels: number) => `${megapixels} MP`;
export const formatFileExtensions = (extensions: string[]) => extensions.join(', ');

export const pluralizeFiles = (fileWithIdList: FileWithId[]) =>
  fileWithIdList.length === 1 ? 'file' : 'files';
