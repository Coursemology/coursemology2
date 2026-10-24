// The rules for the paths of files in a programming question or answer, such as `templates/index.html`.
// They mirror `Course::Assessment::ProgrammingFilePath` on the server rule for rule, and the two test
// suites share one table of cases. A bad path is rejected rather than rewritten, so the name a user
// sees is the name that is stored.

// The evaluator packs files into a tar whose ustar name fields allow 100 bytes after the last split
// and 155 before it.
export const MAX_SEGMENT_BYTES = 100;

// 155, less the 19 bytes of `package/submission/`, the longest folder the package puts in front.
export const MAX_FOLDER_BYTES = 136;

export type PathError = 'invalid' | 'tooLong';

export type PathCollectionError = 'duplicate' | 'fileFolderClash';

/** The length of the text in UTF-8, which is what the limits count. */
export const byteLength = (text: string): number => {
  let bytes = 0;
  // Iterates by code point, so a surrogate pair counts once, as 4 bytes.
  [...text].forEach((character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    if (codePoint < 0x80) bytes += 1;
    else if (codePoint < 0x800) bytes += 2;
    else if (codePoint < 0x10000) bytes += 3;
    else bytes += 4;
  });
  return bytes;
};

// A lone surrogate cannot be encoded as UTF-8. Written without lookbehind, which older Safari lacks.
const LONE_SURROGATE =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/;

const CONTROL_CHARACTER = /\p{Cc}/u;

// What `Pathname.normalize_filename` does to a segment on the server.
const normaliseSegmentLikeServer = (segment: string): string =>
  segment
    .replace(/["?*:|<>\\/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '');

// A segment is valid when the server would leave it unchanged, which also rejects empty, `.` and `..`.
const isValidSegment = (segment: string): boolean =>
  segment !== '' &&
  !CONTROL_CHARACTER.test(segment) &&
  normaliseSegmentLikeServer(segment) === segment;

const isTooLong = (segments: string[]): boolean =>
  segments.some((segment) => byteLength(segment) > MAX_SEGMENT_BYTES) ||
  byteLength(segments.slice(0, -1).join('/')) > MAX_FOLDER_BYTES;

/**
 * Finds the first rule a path breaks.
 *
 * @returns `'invalid'` or `'tooLong'`, or `null` when the path is valid.
 */
export const validatePath = (path: string): PathError | null => {
  if (path === '' || path.includes('\\') || LONE_SURROGATE.test(path))
    return 'invalid';

  const segments = path.split('/');
  if (!segments.every(isValidSegment)) return 'invalid';

  return isTooLong(segments) ? 'tooLong' : null;
};

/**
 * Finds the first rule a folder's path breaks. The folder's path becomes the folder part of every
 * file in it, so it is checked as the folder of a file.
 */
export const validateFolderPath = (path: string): PathError | null =>
  path === '' ? 'invalid' : validatePath(`${path}/x`);

/** Each folder the path is in, such as `a` and `a/b` for `a/b/c`. */
export const foldersOf = (path: string): string[] => {
  const segments = path.split('/');
  return segments
    .slice(0, -1)
    .map((_, index) => segments.slice(0, index + 1).join('/'));
};

/**
 * Finds the first rule that new paths break, among themselves or with the paths of existing files,
 * after each new path is checked by `validatePath`. Clashes among the existing paths alone are not
 * reported, so files saved before these rules don't block a save.
 *
 * @returns `'duplicate'` when two paths differ only in case, `'fileFolderClash'` when a file has the
 *   same path as a folder, or `null` when the paths are valid together.
 */
export const validatePaths = (
  paths: string[],
  existing: string[] = [],
): PathCollectionError | null => {
  const keys = paths.map((path) => path.toLowerCase());
  const keySet = new Set(keys);
  const existingKeys = new Set(existing.map((path) => path.toLowerCase()));
  if (keySet.size !== keys.length || keys.some((key) => existingKeys.has(key)))
    return 'duplicate';

  const newFolders = new Set(keys.flatMap(foldersOf));
  const existingFolders = new Set([...existingKeys].flatMap(foldersOf));
  const clashes =
    [...newFolders].some(
      (folder) => keySet.has(folder) || existingKeys.has(folder),
    ) || [...existingFolders].some((folder) => keySet.has(folder));

  return clashes ? 'fileFolderClash' : null;
};

/**
 * Tidies a path typed or picked by the user, without changing what they will see: trims each segment,
 * turns `\` into `/`, collapses `//`, and drops a leading `/` or `./`. Anything else that breaks the
 * rules is left for `validatePath` to reject.
 */
export const normalisePath = (raw: string): string =>
  raw
    .replace(/\\/g, '/')
    .split('/')
    .map((segment) => segment.trim())
    .filter(
      (segment, index) => segment !== '' && !(index === 0 && segment === '.'),
    )
    .join('/');

export const joinPath = (...parts: string[]): string =>
  parts.filter((part) => part !== '').join('/');

export const basename = (path: string): string =>
  path.slice(path.lastIndexOf('/') + 1);

/** The folder a path is in, or `''` at the top level. */
export const dirname = (path: string): string =>
  path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';

/**
 * The path a picked or dropped file is saved under: its name, inside `targetFolder`. The name is
 * kept as it is, so a name the rules don't allow (a leading space, a `\`) is rejected, not saved
 * under a different name.
 */
export const pathOfFile = (file: File, targetFolder = ''): string =>
  joinPath(targetFolder, file.name);

/**
 * Whether a dropped file came from inside a dropped folder. react-dropzone walks a dropped folder
 * and gives each file a `path` that includes its folders, such as `./site/index.html`; a loose file's
 * `path` is just its name. Folders aren't taken, since one could hold any number of files.
 */
export const isFromDroppedFolder = (file: File): boolean => {
  const dropzonePath = (file as File & { path?: string }).path;
  return Boolean(
    // A `\` in a loose file's name isn't a folder, so the leading `./` or `/` is all that's dropped.
    file.webkitRelativePath ||
      (dropzonePath ?? '').replace(/^\.?\//, '').includes('/'),
  );
};
