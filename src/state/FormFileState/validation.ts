import pipe from 'lodash/flow';
import {
  ACCEPTED_FILE_TYPES,
  MAXIMUM_FILE_SIZE_BYTES,
  MEGAPIXELS,
  MINIMUM_MEGAPIXELS,
} from '../../constants';
import * as validation from '../../helpers/validation';
import { Dimensions } from '../../types/index';
import { FileValidation, FileValidationError } from '../types';

const getResolutionFromDimensions = ({ width, height }: Dimensions): number => width * height;

const getMegapixelsFromDimensions = (dimensions: Dimensions): number =>
  getResolutionFromDimensions(dimensions) / MEGAPIXELS;

const validateMegapixels = (megapixels: number): FileValidation =>
  megapixels < MINIMUM_MEGAPIXELS
    ? new validation.Failure(FileValidationError.InsufficientMegapixels({}))
    : new validation.Success();

const validateDimensions = pipe(
  getMegapixelsFromDimensions,
  validateMegapixels,
);

const validateType = (type: string) =>
  ACCEPTED_FILE_TYPES.includes(type)
    ? new validation.Success()
    : new validation.Failure(FileValidationError.InvalidFileType({}));

const validateSize = (sizeInBytes: number) =>
  sizeInBytes > MAXIMUM_FILE_SIZE_BYTES
    ? new validation.Failure(FileValidationError.ExceedsMaximumFileSize({}))
    : new validation.Success();

export const validate = ({ file, dimensions }: { file: File; dimensions: Dimensions }) => {
  const validations = [
    validateDimensions(dimensions),
    validateType(file.type),
    validateSize(file.size),
  ];

  return validation.aggregate(validations);
};
