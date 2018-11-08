import { range, take } from 'lodash';
import { FILES_UPPER_LIMIT } from '../../../constants';
import * as remoteData from '../../../helpers/remote-data';
import {
  FileStateWith,
  FileWithId,
  FormFileCurrentState,
  FormUploaderState,
  FormValidFileCurrentState,
  UploaderState,
} from '../../types';
import { UploaderActionRecord } from '../../uploader-action';
import { addFilesTransition } from '../form-transitions';

describe('addFilesTransition', () => {
  const createFile = ({ id }: { id: string }) => new File([], id);
  const createFileWithId = ({ id }: { id: string }): FileWithId => ({
    id,
    file: createFile({ id }),
  });

  const createFileState = <C>({
    id,
    currentState,
  }: {
    id: string;
    currentState: C;
  }): FileStateWith<C> => ({
    ...createFileWithId({ id }),
    currentState,
  });

  test('should append new files, up to limit', () => {
    const originalFileCount = 8;

    // Only valid file states are counted against the limit.
    // The value inside the valid current state could be anything.
    const fileCurrentState = FormFileCurrentState.Valid(
      FormValidFileCurrentState.FetchingPresignedUrl({
        dimensions: { width: 0, height: 0 },
        fetchPresignedUrlRequest: new remoteData.NotAsked(),
      }),
    );
    const prevState: FormUploaderState = {
      // This could be true or false.
      shouldHideFilesLimitWarning: false,
      fileStates: range(0, originalFileCount).map(index =>
        createFileState({
          id: `originalFile${index}`,
          currentState: fileCurrentState,
        }),
      ),
    };
    const newFileCount = 10;
    const addFilesAction: UploaderActionRecord['AddFiles'] = {
      files: range(0, newFileCount).map(index =>
        createFile({
          id: `newFile${index}`,
        }),
      ),
    };
    const updatedState = addFilesTransition(prevState)(addFilesAction);

    const remainingLimitCount = FILES_UPPER_LIMIT - originalFileCount;
    const expectedFileStates = [
      ...prevState.fileStates.map(fileState => fileState.file.name),
      ...take(addFilesAction.files, remainingLimitCount).map(file => file.name),
    ];

    const updatedFormUploaderState = UploaderState.as.Form(updatedState);

    const actualFileStates = updatedFormUploaderState.fileStates.map(
      fileState => fileState.file.name,
    );

    expect(actualFileStates).toEqual(expectedFileStates);

    expect(updatedFormUploaderState.shouldHideFilesLimitWarning).toEqual(
      prevState.shouldHideFilesLimitWarning,
    );
  });
});
