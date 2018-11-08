import { createPickedObject } from '../../helpers/typescript';
import { withDefaultsFn } from '../../helpers/with-defaults';
import { FormUploaderState } from '../types';

const createFormUploaderState = (formUploaderState: FormUploaderState): FormUploaderState =>
  formUploaderState;
const formUploaderStateDefaults = createPickedObject<FormUploaderState>()({
  shouldHideFilesLimitWarning: false,
});
export const createFormUploaderStateWithDefaults = withDefaultsFn(
  createFormUploaderState,
  formUploaderStateDefaults,
);
