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
  else if (unwrapped.replacedFrom) state = 'replaced';
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

  // An upload that replaces a file takes its place in the form. A saved file it replaces, even one
  // marked for deletion, is kept as `replacedFrom`, so undoing the replacement brings it back.
  const handleAdd = (uploads: FileTreeUpload[]): void => {
    const added: DraftableDataFile[] = [];
    uploads.forEach(({ path, file, replaces }) => {
      const upload: DraftableDataFile = {
        filename: path,
        size: file.size,
        hash: '',
        raw: file,
      };
      const [index] = replaces === undefined ? [] : indicesOf([replaces]);
      if (index === undefined) {
        added.push(upload);
        return;
      }

      const existing = files[index];
      const saved = isMarked(existing)
        ? unwrap(existing)
        : existing.replacedFrom ?? (existing.raw ? undefined : existing);
      setFile(index, saved ? { ...upload, replacedFrom: saved } : upload);
    });
    if (added.length) append(added as never);
  };

  // A saved file is marked, to be deleted when the form is submitted, as is the saved file a
  // replacement would have replaced; a new upload is dropped.
  const handleDelete = (paths: string[]): void => {
    const drafts: number[] = [];
    indicesOf(paths).forEach((index) => {
      const file = files[index];
      if (isMarked(file)) return;
      if (file.replacedFrom) setFile(index, mark(file.replacedFrom));
      else if (file.raw) drafts.push(index);
      else setFile(index, mark(file));
    });
    if (drafts.length) remove(drafts);
  };

  // Keeps a marked file, and undoes a replacement.
  const handleRestore = (paths: string[]): void =>
    indicesOf(paths).forEach((index) => {
      const file = files[index];
      setFile(index, isMarked(file) ? unwrap(file) : file.replacedFrom ?? file);
    });

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
