import range from 'lodash/range';
import React from 'react';
import Form from '.';
import { FILES_UPPER_LIMIT } from '../../constants';
import {
  createFormFileStateInvalidWithFetchDimensionsFailure,
  createFormFileStateInvalidWithValidationErrors,
  createFormFileStateValidAndFailure,
  createFormFileStateValidAndUploaded,
  createFormFileStateValidAndUploading,
  DemoWrapper,
} from '../../helpers/demos';
import { FileValidationError } from '../../state/types';
import { createFormUploaderStateWithDefaults } from '../../state/UploaderState/helpers';

export const formDemos = (
  <div>
    <h2>
      <code>Form</code>
    </h2>
    <h3>No files</h3>
    <DemoWrapper>
      <Form
        uploaderState={createFormUploaderStateWithDefaults({
          fileStates: [],
        })}
      />
    </DemoWrapper>
    <h3>One valid file: uploading</h3>
    <DemoWrapper>
      <Form
        uploaderState={createFormUploaderStateWithDefaults({
          fileStates: [createFormFileStateValidAndUploading()],
        })}
      />
    </DemoWrapper>
    <h3>One valid file: failure</h3>
    <DemoWrapper>
      <Form
        uploaderState={createFormUploaderStateWithDefaults({
          fileStates: [createFormFileStateValidAndFailure()],
        })}
      />
    </DemoWrapper>
    <h3>One valid file: uploaded</h3>
    <DemoWrapper>
      <Form
        uploaderState={createFormUploaderStateWithDefaults({
          fileStates: [createFormFileStateValidAndUploaded()],
        })}
      />
    </DemoWrapper>
    <h3>with invalid files</h3>
    <DemoWrapper>
      <Form
        uploaderState={createFormUploaderStateWithDefaults({
          fileStates: [
            createFormFileStateInvalidWithValidationErrors([
              FileValidationError.InsufficientMegapixels({}),
              FileValidationError.ExceedsMaximumFileSize({}),
              FileValidationError.InvalidFileType({}),
            ]),
            createFormFileStateInvalidWithValidationErrors([
              FileValidationError.ExceedsMaximumFileSize({}),
              FileValidationError.InvalidFileType({}),
            ]),
            createFormFileStateInvalidWithValidationErrors([
              FileValidationError.InvalidFileType({}),
            ]),
            createFormFileStateInvalidWithFetchDimensionsFailure({
              reason: 'Failed to load image.',
            }),
            createFormFileStateValidAndUploaded(),
          ],
        })}
      />
    </DemoWrapper>
    <h3>Limit hit</h3>
    <DemoWrapper>
      <Form
        uploaderState={createFormUploaderStateWithDefaults({
          fileStates: range(FILES_UPPER_LIMIT).map(createFormFileStateValidAndUploaded),
        })}
      />
    </DemoWrapper>
  </div>
);
