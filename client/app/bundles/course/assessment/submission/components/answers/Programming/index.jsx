import { useRef } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Box } from '@mui/material';
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
import { parseLanguages } from '../../../utils';
import GetHelpChatPage from '../../GetHelpChatPage';

import ProgrammingFile from './ProgrammingFile';

const ProgrammingFiles = ({
  readOnly,
  answerId,
  questionId,
  language,
  saveAnswerAndUpdateClientVersion,
}) => {
  const { control } = useFormContext();

  const liveFeedbackChatForAnswer = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );
  const submission = useAppSelector(getSubmission);
  const isAttempting = submission.workflowState === workflowStates.Attempting;

  const isLiveFeedbackChatOpen =
    liveFeedbackChatForAnswer?.isLiveFeedbackChatOpen;

  const { fields } = useFieldArray({
    control,
    name: `${answerId}.files_attributes`,
  });

  const currentField = useWatch({
    control,
    name: `${answerId}.files_attributes`,
  });

  const editorRef = useRef(null);

  const focusEditorOnFeedbackLine = (linenum) => {
    editorRef.current?.editor?.gotoLine(linenum, 0);
    editorRef.current?.editor?.selection?.setAnchor(linenum - 1, 0);
    editorRef.current?.editor?.selection?.moveCursorTo(linenum - 1, 0);
    editorRef.current?.editor?.focus();
  };

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
      <div
        key={keyString}
        className="flex w-full relative gap-3 mb-1 max-h-full"
        id={keyString}
      >
        <Box
          className={`${isLiveFeedbackChatOpen && isAttempting ? 'w-1/2' : 'w-full'}`}
        >
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
        </Box>
        {isLiveFeedbackChatOpen && isAttempting && (
          <div className="absolute h-full flex w-1/2 whitespace-nowrap right-0">
            <GetHelpChatPage
              answerId={answerId}
              onFeedbackClick={focusEditorOnFeedbackLine}
              questionId={questionId}
            />
          </div>
        )}
      </div>
    );
  });
};

const Programming = (props) => {
  const { question, readOnly, answerId, saveAnswerAndUpdateClientVersion } =
    props;
  const fileSubmission = question.fileSubmission;
  const isSavingAnswer = useAppSelector((state) =>
    getIsSavingAnswer(state, answerId),
  );

  const feedbackFiles = useAppSelector(
    (state) =>
      state.assessments.submission.liveFeedback?.feedbackByQuestion?.[
        question.id
      ]?.feedbackFiles ?? [],
  );

  return (
    <div className="mt-5">
      {fileSubmission ? (
        <ProgrammingImportEditor
          key={question.id}
          answerId={answerId}
          isSavingAnswer={isSavingAnswer}
          question={question}
          readOnly={readOnly}
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
      ) : (
        <ProgrammingFiles
          key={question.id}
          answerId={answerId}
          feedbackFiles={feedbackFiles}
          language={parseLanguages(question.language)}
          questionId={question.id}
          readOnly={readOnly}
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
      )}
      <CodaveriFeedbackStatus answerId={answerId} questionId={question.id} />
    </div>
  );
};

Programming.propTypes = {
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  answerId: PropTypes.number.isRequired,
  saveAnswerAndUpdateClientVersion: PropTypes.func.isRequired,
};

export default Programming;
