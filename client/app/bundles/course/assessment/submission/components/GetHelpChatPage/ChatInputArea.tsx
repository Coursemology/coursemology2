import { FC, useState } from 'react';
import { Send } from '@mui/icons-material';
import { IconButton, TextField } from '@mui/material';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { generateLiveFeedback } from '../../actions/answers';
import { sendPromptFromStudent } from '../../reducers/liveFeedbackChats';
import { getLiveFeedbackChatsForQuestionId } from '../../selectors/liveFeedbackChats';
import { getQuestionFlags } from '../../selectors/questionFlags';
import { getQuestions } from '../../selectors/questions';
import { getSubmission } from '../../selectors/submissions';
import translations from '../../translations';

interface ChatInputAreaProps {
  answerId: number;
  questionId: number;
}

const ChatInputArea: FC<ChatInputAreaProps> = (props) => {
  const { answerId, questionId } = props;
  const [input, setInput] = useState('');

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);

  const question = questions[questionId];
  const submissionId = getSubmissionId();
  const questionFlags = useAppSelector(getQuestionFlags);
  const liveFeedbackChatsForQuestion = useAppSelector((state) =>
    getLiveFeedbackChatsForQuestionId(state, questionId),
  );

  const { graderView } = submission;
  const { attemptsLeft } = question;
  const { isResetting } = questionFlags[questionId] || {};

  const isRequestingLiveFeedback =
    liveFeedbackChatsForQuestion?.isRequestingLiveFeedback ?? false;
  const isPollingLiveFeedback =
    (liveFeedbackChatsForQuestion?.pendingFeedbackToken ?? false) !== false;

  const textFieldDisabled =
    isResetting ||
    isRequestingLiveFeedback ||
    isPollingLiveFeedback ||
    (!graderView && attemptsLeft === 0);

  const sendButtonDisabled = textFieldDisabled || input.trim() === '';

  const sendMessage = (): void => {
    dispatch(
      sendPromptFromStudent({ submissionId, questionId, message: input }),
    );
    dispatch(
      generateLiveFeedback({
        submissionId,
        answerId,
        questionId,
        noFeedbackMessage: t(translations.liveFeedbackNoneGenerated),
        errorMessage: t(translations.requestFailure),
      }),
    );
    setInput('');
  };

  return (
    <div className="flex flex-end p-2 w-full items-center justify-between gap-3">
      <TextField
        disabled={textFieldDisabled}
        fullWidth
        multiline
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && input.trim() !== '') {
            e.preventDefault();
            e.stopPropagation();
            sendMessage();
          }
        }}
        placeholder={t(translations.chatInputText)}
        size="small"
        value={input}
        variant="outlined"
      />
      <IconButton disabled={sendButtonDisabled} onClick={() => sendMessage()}>
        {isRequestingLiveFeedback || isPollingLiveFeedback ? (
          <LoadingIndicator bare size={20} />
        ) : (
          <Send
            className={`${sendButtonDisabled ? 'fill-gray-200' : 'fill-blue-400'}`}
          />
        )}
      </IconButton>
    </div>
  );
};

export default ChatInputArea;
