import { MutableRefObject, useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { LanguageMode } from 'types/course/assessment/question/programming';
import { ProgrammingContent } from 'types/course/assessment/submission/answer/programming';

import { filePathsInTreeOrder } from 'course/assessment/components/FileTreeManager/tree';
import { workflowStates } from 'course/assessment/submission/constants';
import { getIsSavingAnswer } from 'course/assessment/submission/selectors/answerFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import { useAppSelector } from 'lib/hooks/store';

import CodaveriFeedbackStatus from '../../../containers/CodaveriFeedbackStatus';
import ProgrammingImportEditor from '../../../containers/ProgrammingImport/ProgrammingImportEditor';
import { getLiveFeedbackChatsForAnswerId } from '../../../selectors/liveFeedbackChats';
import GetHelpChatPage from '../../GetHelpChatPage';
import { ProgrammingAnswerProps } from '../types';

import ProgrammingFile from './ProgrammingFile';

interface ProgrammingFilesProps {
  readOnly: boolean;
  answerId: number;
  editorRef: MutableRefObject<null>;
  language: LanguageMode;
  saveAnswerAndUpdateClientVersion: (answerId: number) => void;
}

const ProgrammingFiles = (props: ProgrammingFilesProps): JSX.Element => {
  const {
    readOnly,
    answerId,
    editorRef,
    language,
    saveAnswerAndUpdateClientVersion,
  } = props;
  const { control } = useFormContext();

  const { fields } = useFieldArray({
    control,
    name: `${answerId}.files_attributes`,
  });

  const currentField = useWatch({
    control,
    name: `${answerId}.files_attributes`,
  }) as ProgrammingContent[];

  const controlledProgrammingFields = fields.map((field, index) => ({
    ...field,
    ...currentField[index],
  }));

  return (
    <>
      {controlledProgrammingFields.map((field, index) => {
        const file: ProgrammingContent = {
          id: field.id,
          filename: field.filename,
          content: field.content,
          highlightedContent: field.highlightedContent,
        };

        const keyString = `editor-container-${index}`;

        return (
          <div key={keyString} id={keyString}>
            <ProgrammingFile
              key={field.id}
              answerId={answerId}
              editorRef={editorRef}
              fieldName={`${answerId}.files_attributes.${index}.content`}
              file={file}
              language={language}
              readOnly={readOnly}
              saveAnswerAndUpdateClientVersion={
                saveAnswerAndUpdateClientVersion
              }
            />
          </div>
        );
      })}
    </>
  );
};

const Programming = (props: ProgrammingAnswerProps): JSX.Element | null => {
  const { question, readOnly, answerId, saveAnswerAndUpdateClientVersion } =
    props;

  const { control } = useFormContext();
  const currentAnswer = useWatch({ control });

  const liveFeedbackChatForAnswer = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );
  const submission = useAppSelector(getSubmission);
  const isAttempting = submission.workflowState === workflowStates.Attempting;

  // Get Help is a one-on-one conversation between the student and Codaveri, so the chat panel is
  // shown only to the submission's own creator, never to staff viewing the attempt.
  const isLiveFeedbackChatOpen =
    liveFeedbackChatForAnswer?.isLiveFeedbackChatOpen && submission.isCreator;
  const fileSubmission = question.fileSubmission;
  const isSavingAnswer = useAppSelector(
    (state) => answerId !== null && getIsSavingAnswer(state, answerId),
  );

  const files = (
    answerId !== null ? currentAnswer[answerId]?.files_attributes ?? null : null
  ) as ProgrammingContent[] | null;

  // The file shown in the editor, by its path. It starts at the first file the tree shows.
  const [displayFileName, setDisplayFileName] = useState(
    () =>
      filePathsInTreeOrder((files ?? []).map((file) => file.filename))[0] ?? '',
  );

  const editorRef = useRef(null);

  // A programming answer always has an id; the shared props allow none for other question types.
  if (answerId === null) return null;

  return (
    <>
      <div className="flex w-full relative gap-3 mb-1 max-h-[100%]">
        <div
          className={`${isLiveFeedbackChatOpen && isAttempting ? 'w-1/2' : 'w-full'}`}
        >
          {fileSubmission ? (
            <ProgrammingImportEditor
              key={question.id}
              answerId={answerId}
              displayFileName={displayFileName}
              editorRef={editorRef}
              isSavingAnswer={isSavingAnswer}
              question={question}
              readOnly={readOnly}
              saveAnswerAndUpdateClientVersion={
                saveAnswerAndUpdateClientVersion
              }
              setDisplayFileName={setDisplayFileName}
            />
          ) : (
            <ProgrammingFiles
              key={question.id}
              answerId={answerId}
              editorRef={editorRef}
              language={question.editorMode}
              readOnly={readOnly}
              saveAnswerAndUpdateClientVersion={
                saveAnswerAndUpdateClientVersion
              }
            />
          )}
        </div>
        {isLiveFeedbackChatOpen && isAttempting && (
          <div className="absolute h-[100%] flex w-1/2 whitespace-nowrap right-0">
            <GetHelpChatPage answerId={answerId} questionId={question.id} />
          </div>
        )}
      </div>
      <CodaveriFeedbackStatus answerId={answerId} questionId={question.id} />
    </>
  );
};

export default Programming;
