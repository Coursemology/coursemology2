import { useMemo } from 'react';
import {
  FieldArrayPath,
  FieldPath,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { ProgrammingFormData } from 'types/course/assessment/question/programming';

import FileTreeManager, {
  FileTreeEntry,
  FileTreeUpload,
} from 'course/assessment/components/FileTreeManager';

import {
  DraftableDataFile,
  isMarked,
  mark,
  MaybeMarked,
  unwrap,
} from '../../commons/draftFiles';

interface QuestionFilesManagerProps {
  name: FieldArrayPath<ProgrammingFormData>;
  headless?: boolean;
  disabled?: boolean;
}

type FormFile = MaybeMarked<DraftableDataFile>;

const entryOf = (file: FormFile): FileTreeEntry => {
  const unwrapped = unwrap(file);
  let state: FileTreeEntry['state'] = 'saved';
  if (isMarked(file)) state = 'marked';
  else if (unwrapped.raw) state = 'draft';

  return { path: unwrapped.filename, size: unwrapped.size, state };
};

/**
 * The files of a programming question in the question form: its data files, or its submission or
 * solution files when the templates are files. Changes stay in the form until it is submitted.
 */
const QuestionFilesManager = (
  props: QuestionFilesManagerProps,
): JSX.Element => {
  const { name } = props;
  const { control, setValue } = useFormContext<ProgrammingFormData>();
  const { append, remove } = useFieldArray({ control, name });
  const files = (useWatch({ control, name }) ?? []) as FormFile[];

  const entries = useMemo(() => files.map(entryOf), [files]);

  const indicesOf = (paths: string[]): number[] =>
    files.flatMap((file, index) =>
      paths.includes(unwrap(file).filename) ? [index] : [],
    );

  const setFile = (index: number, file: FormFile): void =>
    setValue(
      `${name}.${index}` as FieldPath<ProgrammingFormData>,
      file as never,
      { shouldDirty: true },
    );

  const handleAdd = (uploads: FileTreeUpload[]): void =>
    append(
      uploads.map(
        ({ path, file }): DraftableDataFile => ({
          filename: path,
          size: file.size,
          hash: '',
          raw: file,
        }),
      ) as never,
    );

  // A saved file is marked, to be deleted when the form is submitted; a new upload is dropped.
  const handleDelete = (paths: string[]): void => {
    const drafts: number[] = [];
    indicesOf(paths).forEach((index) => {
      const file = files[index];
      if (isMarked(file)) return;
      if (file.raw) drafts.push(index);
      else setFile(index, mark(file));
    });
    if (drafts.length) remove(drafts);
  };

  const handleRestore = (paths: string[]): void =>
    indicesOf(paths).forEach((index) => setFile(index, unwrap(files[index])));

  const handleRename = (from: string, to: string): void =>
    indicesOf([from]).forEach((index) =>
      setFile(index, { ...unwrap(files[index]), filename: to }),
    );

  return (
    <FileTreeManager
      canCreateFolder
      commit="draft"
      disabled={props.disabled}
      files={entries}
      filesDeleteable
      foldersDeleteable
      headless={props.headless}
      onAdd={handleAdd}
      onDelete={handleDelete}
      onRename={handleRename}
      onRestore={handleRestore}
      renamable
      uploadable
    />
  );
};

export default QuestionFilesManager;
