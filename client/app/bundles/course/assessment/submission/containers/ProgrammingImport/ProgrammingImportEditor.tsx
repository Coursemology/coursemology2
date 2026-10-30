import { memo, Ref } from 'react';
import AceEditor from 'react-ace';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { LanguageMode } from 'types/course/assessment/question/programming';
import { ProgrammingContent } from 'types/course/assessment/submission/answer/programming';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { useAppSelector } from 'lib/hooks/store';

import Editor from '../../components/Editor';
import ReadOnlyEditor from '../ReadOnlyEditor';

import AnswerFilesTree from './AnswerFilesTree';

/** A file in the answer form. A file read from an upload is `staged` until the server saves it. */
type AnswerFormFile = ProgrammingContent & { staged?: boolean };

interface SelectProgrammingFileEditorProps {
  answerId: number;
  editorRef?: Ref<AceEditor>;
  readOnly: boolean;
  language: LanguageMode;
  displayFileName: string;
  saveAnswerAndUpdateClientVersion: (answerId: number) => void;
}

const SelectProgrammingFileEditor = (
  props: SelectProgrammingFileEditorProps,
): JSX.Element => {
  const {
    answerId,
    editorRef,
    readOnly,
    language,
    displayFileName,
    saveAnswerAndUpdateClientVersion,
  } = props;
  const { control } = useFormContext();
  const { fields } = useFieldArray({
    control,
    name: `${answerId}.files_attributes`,
  });

  const currentFields = useWatch({
    control,
    name: `${answerId}.files_attributes`,
  }) as AnswerFormFile[];

  const controlledProgrammingFields: AnswerFormFile[] =
    currentFields.length === fields.length
      ? fields.map((field, index) => ({
          ...field,
          ...currentFields[index],
        }))
      : currentFields;

  return (
    <>
      {controlledProgrammingFields.map((file, index) => {
        if (readOnly) {
          return (
            <ReadOnlyEditor key={file.id} answerId={answerId} file={file} />
          );
        }
        if (file.filename === displayFileName && !file.staged) {
          return (
            // The editor is bound to the file's position, so it must remount if the file moves:
            // a mounted editor keeps showing the value of the position it was created for.
            <Editor
              key={`${file.id}-${index}`}
              editorRef={editorRef}
              fieldName={`${answerId}.files_attributes.${index}.content`}
              language={language}
              onChangeCallback={(): void =>
                saveAnswerAndUpdateClientVersion(answerId)
              }
            />
          );
        }
        return null;
      })}
    </>
  );
};

interface ProgrammingImportEditorProps {
  answerId: number;
  question: SubmissionQuestionData<'Programming'>;
  readOnly: boolean;
  isSavingAnswer: boolean;
  displayFileName: string;
  setDisplayFileName: (path: string) => void;
  saveAnswerAndUpdateClientVersion: (answerId: number) => void;
  editorRef?: Ref<AceEditor>;
}

const ProgrammingImportEditor = (
  props: ProgrammingImportEditorProps,
): JSX.Element | null => {
  const {
    answerId,
    editorRef,
    question,
    readOnly,
    isSavingAnswer,
    displayFileName,
    setDisplayFileName,
    saveAnswerAndUpdateClientVersion,
  } = props;
  const { control } = useFormContext();
  const answers = useWatch({ control });
  const isSavingSubmission = useAppSelector(
    (state) => state.assessments.submission.submissionFlags.isSaving,
  );
  const disabled = isSavingSubmission || isSavingAnswer;

  // When an assessment is submitted/unsubmitted,
  // the form is somehow not reset yet and the answers for the new answerId
  // can't be found.
  if (!answers[answerId]) {
    return null;
  }

  const editor = (
    <SelectProgrammingFileEditor
      answerId={answerId}
      displayFileName={displayFileName}
      editorRef={editorRef}
      language={question.editorMode}
      readOnly={readOnly}
      saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
    />
  );

  // Read-only answers stack every file, so they have no file tree.
  if (readOnly) return editor;

  // The file tree sits to the left of the editor, as in a code editor, and is as tall as the
  // editor: the editor alone sets the row's height, the tree fills it, and the tree's rows scroll.
  // On a narrow screen the tree goes above the editor at its own height. The minimum height keeps
  // the tree usable when no file is open, so there is no editor to set the height. The space below
  // belongs to the row, so the tree and the editor end at the same line.
  return (
    <div className="mb-3 flex flex-col md:flex-row">
      <div className="relative w-full flex-none md:min-h-80 md:w-80 xl:w-96">
        <div className="md:absolute md:inset-0">
          <AnswerFilesTree
            answerId={answerId}
            disabled={disabled}
            displayFileName={displayFileName}
            language={question.editorMode}
            setDisplayFileName={setDisplayFileName}
          />
        </div>
      </div>
      <div className="min-w-0 flex-1">{editor}</div>
    </div>
  );
};

// `connect` used to skip re-rendering when the props were shallowly equal; `memo` keeps that.
export default memo(ProgrammingImportEditor);
