import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../constants/file.constants';

export function hasAllowedExtension(file: File, allowed = ALLOWED_EXTENSIONS): boolean {
  const name = file.name.toLowerCase();
  return allowed.some(ext => name.endsWith(ext));
}

export function hasAllowedMime(file: File, allowed = ALLOWED_MIME_TYPES): boolean {
  return allowed.includes(file.type) || file.type === '';
}

export function isUnderMaxSize(file: File, max = MAX_FILE_SIZE_BYTES): boolean {
  return file.size <= max;
}
