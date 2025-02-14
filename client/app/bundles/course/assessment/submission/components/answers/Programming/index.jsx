import { useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import PropTypes from 'prop-types';

import { workflowStates } from 'course/assessment/submission/constants';
import { getIsSavingAnswer } from 'course/assessment/submission/selectors/answerFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import { useAppSelector } from 'lib/hooks/store';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

import CodaveriFeedbackStatus from '../../../containers/CodaveriFeedbackStatus';
import ProgrammingImportEditor from '../../../containers/ProgrammingImport/ProgrammingImportEditor';
import { questionShape } from '../../../propTypes';
import { getLiveFeedbackChatsForAnswerId } from '../../../selectors/liveFeedbackChats';
import GetHelpChatPage from '../../GetHelpChatPage';

import ProgrammingFile from './ProgrammingFile';

const ProgrammingFiles = ({
  readOnly,
  answerId,
  editorRef,
  language,
  saveAnswerAndUpdateClientVersion,
}) => {
  const { control } = useFormContext();

  const { fields } = useFieldArray({
    control,
    name: `${answerId}.files_attributes`,
  });

  const currentField = useWatch({
    control,
    name: `${answerId}.files_attributes`,
  });

  const controlledProgrammingFields = fields.map((field, index) => ({
    ...field,
    ...currentField[index],
  }));

  return controlledProgrammingFields.map((field, index) => {
    const file = {
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
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
      </div>
    );
  });
};

const Programming = (props) => {
  const { question, readOnly, answerId, saveAnswerAndUpdateClientVersion } =
    props;

  const { control } = useFormContext();
  const currentAnswer = useWatch({ control });

  const liveFeedbackChatForAnswer = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );
  const submission = useAppSelector(getSubmission);
  const isAttempting = submission.workflowState === workflowStates.Attempting;

  const isLiveFeedbackChatOpen =
    liveFeedbackChatForAnswer?.isLiveFeedbackChatOpen;
  const fileSubmission = question.fileSubmission;
  const isSavingAnswer = useAppSelector((state) =>
    getIsSavingAnswer(state, answerId),
  );

  const files = currentAnswer[answerId]
    ? currentAnswer[answerId].files_attributes ||
      currentAnswer[`${answerId}`].files_attributes
    : null;

  const [displayFileName, setDisplayFileName] = useState(
    files && files.length > 0 ? files[0].filename : '',
  );

  const editorRef = useRef(null);

  const feedbackFiles = useAppSelector(
    (state) =>
      state.assessments.submission.liveFeedback?.feedbackByQuestion?.[
        question.id
      ]?.feedbackFiles ?? [],
  );

  return (
    <>
      <div className="mt-5 flex w-full relative gap-3 mb-1 max-h-[100%]">
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
              feedbackFiles={feedbackFiles}
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

Programming.propTypes = {
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  answerId: PropTypes.number.isRequired,
  saveAnswerAndUpdateClientVersion: PropTypes.func.isRequired,
};

export default Programming;
