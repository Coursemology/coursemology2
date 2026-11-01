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
  FileTreeMove,
  FileTreeUpload,
} from 'course/assessment/components/FileTreeManager';

import {
  DraftableDataFile,
  isMarked,
  mark,
  MaybeMarked,
  savedFileOf,
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
  else if (unwrapped.movedFrom) state = 'moved';

  return {
    path: unwrapped.filename,
    size: unwrapped.size,
    state,
    previousPath: unwrapped.movedFrom,
  };
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
        : existing.replacedFrom ??
          (existing.raw ? undefined : savedFileOf(existing));
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
      else setFile(index, mark(savedFileOf(file)));
    });
    if (drafts.length) remove(drafts);
  };

  // Keeps a marked file, and undoes a replacement or a rename.
  const handleRestore = (paths: string[]): void =>
    indicesOf(paths).forEach((index) => {
      const file = files[index];
      setFile(
        index,
        isMarked(file) ? unwrap(file) : file.replacedFrom ?? savedFileOf(file),
      );
    });

  // A new upload, or a replacement, just takes the new path. A saved file remembers its saved path,
  // and stops being moved if it gets it back. A file marked for deletion stays where it is, so it
  // is still deleted under its saved path.
  const handleMove = (moves: FileTreeMove[]): void =>
    moves.forEach(({ from, to }) =>
      indicesOf([from]).forEach((index) => {
        const file = files[index];
        if (isMarked(file)) return;
        if (file.raw) {
          setFile(index, { ...file, filename: to });
          return;
        }

        const saved = savedFileOf(file);
        setFile(
          index,
          to === saved.filename
            ? saved
            : { ...saved, filename: to, movedFrom: saved.filename },
        );
      }),
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
      movable
      onAdd={handleAdd}
      onDelete={handleDelete}
      onMove={handleMove}
      onRestore={handleRestore}
      uploadable
    />
  );
};

export default QuestionFilesManager;
