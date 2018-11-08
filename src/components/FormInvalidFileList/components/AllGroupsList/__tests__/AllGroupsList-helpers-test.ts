import {
  FileValidationError,
  FileWithId,
  FormInvalidFileCurrentState,
  FormInvalidFileState,
} from '../../../../../state/types';
import { AllGroupsList, groupInvalidFiles } from '../AllGroupsList-helpers';

describe('groupInvalidFiles', () => {
  const createFileWithId = ({ id }: { id: string }): FileWithId => ({
    id,
    file: new File([], id),
  });

  test('given any number and configuration of invalid file states, should group each state into all applicable groups', () => {
    const fileWithId1 = createFileWithId({ id: 'file1' });
    const fileWithId2 = createFileWithId({ id: 'file2' });
    const fileWithId3 = createFileWithId({ id: 'file3' });

    const fileStates: FormInvalidFileState[] = [
      {
        ...fileWithId1,
        currentState: FormInvalidFileCurrentState.ValidationErrors([
          FileValidationError.ExceedsMaximumFileSize({}),
          FileValidationError.InsufficientMegapixels({}),
        ]),
      },
      {
        ...fileWithId2,
        currentState: FormInvalidFileCurrentState.ValidationErrors([
          FileValidationError.InsufficientMegapixels({}),
          FileValidationError.InvalidFileType({}),
        ]),
      },
      {
        ...fileWithId3,
        currentState: FormInvalidFileCurrentState.FetchDimensionsFailure({
          reason: 'foo',
        }),
      },
    ];
    const result = groupInvalidFiles({ fileStates });

    const expectedResult: AllGroupsList = {
      ValidationErrors: {
        ExceedsMaximumFileSize: [fileWithId1],
        InsufficientMegapixels: [fileWithId1, fileWithId2],
        InvalidFileType: [fileWithId2],
      },
      FetchDimensionsFailure: [fileWithId3],
    };

    expect(result).toEqual(expectedResult);
  });
});
