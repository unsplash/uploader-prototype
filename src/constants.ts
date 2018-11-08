export const IMAGE_JPEG_TYPE = 'image/jpeg';

export const MEGAPIXELS = 1e6;

const KILOBYTE = 1e3;
const MEGABYTE = KILOBYTE * 1000;

// Validation etc.

export const MINIMUM_MEGAPIXELS = 5;

export const ACCEPTED_FILE_TYPES = [IMAGE_JPEG_TYPE];
export const ACCEPTED_FILE_EXTENSIONS = ['jpg', 'jpeg'];

export const MAXIMUM_FILE_SIZE_MEGABYTES = 50;
export const MAXIMUM_FILE_SIZE_BYTES = MEGABYTE * MAXIMUM_FILE_SIZE_MEGABYTES;

export const FILES_UPPER_LIMIT = 10;
