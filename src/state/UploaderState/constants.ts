import { UploaderState } from '../types';
import { createFormUploaderStateWithDefaults } from './helpers';

export const INITIAL_UPLOADER_STATE = UploaderState.Form(
  createFormUploaderStateWithDefaults({ fileStates: [] }),
);
