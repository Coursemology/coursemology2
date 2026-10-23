import { DataFile } from 'types/course/assessment/question/programming';

// How the question form holds its files until it is submitted. A saved file is a `DataFile`; a new
// upload also carries its `raw` File; a saved file marked for deletion is wrapped as `[file]`.

export type Marked<T> = [T];
export type MaybeMarked<T> = T | Marked<T>;

export const mark = <T>(thing: T): Marked<T> => [thing];

export const isMarked = <T>(thing: MaybeMarked<T>): thing is Marked<T> =>
  Array.isArray(thing);

export const unwrap = <T>(thing: MaybeMarked<T>): T =>
  isMarked(thing) ? thing[0] : thing;

export interface DraftableDataFile extends DataFile {
  raw?: File;
}

export const isDraftable = (
  file: DataFile | DraftableDataFile,
): file is DraftableDataFile => 'raw' in file;
