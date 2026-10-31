import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import FileTreeManager, {
  FileTreeEntry,
  FileTreeUpload,
} from 'course/assessment/components/FileTreeManager';
import { byteLength } from 'course/assessment/components/FileTreeManager/paths';
import { filePathsInTreeOrder } from 'course/assessment/components/FileTreeManager/tree';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import {
  deleteProgrammingFile,
  importProgrammingFiles,
} from '../../actions/answers/programming';
import { workflowStates } from '../../constants';
import { getSubmission } from '../../selectors/submissions';

/** A file in the answer form. A file read from an upload is `staged` until the server saves it. */
interface AnswerFile {
  id?: number;
  filename: string;
  content: string;
  staged?: boolean;
}

interface AnswerFilesTreeProps {
  answerId: number;
  /** The question's editor mode, which decides what files the language accepts. */
  language: string;
  displayFileName: string;
  setDisplayFileName: (path: string) => void;
  disabled?: boolean;
}

const readText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as string);
    reader.onerror = (): void => reject(reader.error);
    reader.readAsText(file);
  });

/**
 * The files of a student's answer to a question whose templates are files. Each change is saved as
 * it is made; the save actions report their own failures.
 */
const AnswerFilesTree = (props: AnswerFilesTreeProps): JSX.Element => {
  const { answerId, displayFileName, setDisplayFileName } = props;
  const dispatch = useAppDispatch();
  const { control, getValues, register, resetField } = useFormContext();

  // A save resets the whole answer with `resetField`, which leaves an answer alone unless a field
  // in it is registered. An answer with no files has no editor to register one, so its staging
  // field is registered here, as the upload dropzone used to.
  register(`${answerId}.import_files`);

  const files = (useWatch({ control, name: `${answerId}.files_attributes` }) ??
    []) as AnswerFile[];

  const workflowState = useAppSelector(
    (state) => getSubmission(state).workflowState,
  );
  const isCreator = useAppSelector((state) => getSubmission(state).isCreator);
  const canDestroyFiles =
    workflowState === workflowStates.Attempting && isCreator;

  const entries = useMemo(
    (): FileTreeEntry[] =>
      files
        .filter((file) => !file.staged)
        .map((file) => ({
          path: file.filename,
          size: byteLength(file.content ?? ''),
        })),
    [files],
  );

  const currentFiles = (): AnswerFile[] =>
    getValues()[answerId]?.files_attributes ?? [];

  // An upload that replaces a saved file is sent as that file, by its id, with the upload's name
  // and content; the others are new files.
  const handleAdd = async (uploads: FileTreeUpload[]): Promise<void> => {
    const contents = await Promise.all(
      uploads.map((upload) => readText(upload.file)),
    );
    const replacements = new Map(
      uploads.flatMap((upload, index) =>
        upload.replaces === undefined
          ? []
          : [
              [
                upload.replaces,
                { path: upload.path, content: contents[index] },
              ],
            ],
      ),
    );
    const saved: AnswerFile[] = currentFiles().map((file) => {
      const replacement = replacements.get(file.filename);
      return replacement
        ? {
            ...file,
            filename: replacement.path,
            content: replacement.content,
            staged: true,
          }
        : file;
    });
    const staged: AnswerFile[] = uploads.flatMap((upload, index) =>
      upload.replaces === undefined
        ? [{ filename: upload.path, content: contents[index], staged: true }]
        : [],
    );

    await dispatch(
      importProgrammingFiles(
        answerId,
        saved.concat(staged),
        props.language,
        resetField,
      ),
    );

    // The shown file is chosen from what the server saved, not from what was asked for: a refused
    // upload saves nothing, and the editor must never point at a file that doesn't exist. A shown
    // file replaced under a name that differs in case stays shown, under its new name.
    const savedPaths = currentFiles()
      .filter((file) => !file.staged)
      .map((file) => file.filename);
    const shown = [
      replacements.get(displayFileName)?.path,
      displayFileName,
    ].find((path) => path !== undefined && savedPaths.includes(path));
    if (shown !== displayFileName)
      setDisplayFileName(shown ?? filePathsInTreeOrder(savedPaths)[0] ?? '');
  };

  const deleteFile = (path: string): Promise<void> => {
    const answer = getValues()[answerId];
    const file = currentFiles().find(
      (candidate) => candidate.filename === path,
    );
    if (!file?.id) return Promise.resolve();

    const fileId = file.id;
    const orderBefore = filePathsInTreeOrder(
      currentFiles().map((candidate) => candidate.filename),
    );

    const onDeleteSuccess = (): void => {
      const remaining = currentFiles().filter(
        (candidate) => candidate.id !== fileId,
      );
      resetField(`${answerId}.files_attributes`, { defaultValue: remaining });
      if (path !== displayFileName) return;

      // Show the file that took the deleted one's place in the tree, or the last one.
      const order = filePathsInTreeOrder(
        remaining.map((candidate) => candidate.filename),
      );
      const index = Math.min(orderBefore.indexOf(path), order.length - 1);
      setDisplayFileName(order[index] ?? '');
    };

    return dispatch(deleteProgrammingFile(answer, fileId, onDeleteSuccess));
  };

  // One at a time: the server deletes one file per request.
  const handleDelete = (paths: string[]): Promise<void> =>
    paths.reduce<Promise<void>>(
      (previous, path) => previous.then(() => deleteFile(path)),
      Promise.resolve(),
    );

  return (
    <FileTreeManager
      canCreateFolder
      commit="immediate"
      compact
      disabled={props.disabled}
      files={entries}
      filesDeleteable={canDestroyFiles}
      fillHeight
      onAdd={handleAdd}
      onDelete={handleDelete}
      onSelect={setDisplayFileName}
      selectable
      selectedPath={displayFileName}
      uploadable
    />
  );
};

export default AnswerFilesTree;
