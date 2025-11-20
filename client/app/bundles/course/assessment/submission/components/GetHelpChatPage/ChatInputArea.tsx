import { FC, useState } from 'react';
import { Send } from '@mui/icons-material';
import { IconButton } from '@mui/material';

import TextField from 'lib/components/core/fields/TextField';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { SYNC_STATUS } from 'lib/constants/sharedConstants';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { generateLiveFeedback } from '../../actions/answers';
import { sendPromptFromStudent } from '../../reducers/liveFeedbackChats';
import { getLiveFeedbackChatsForAnswerId } from '../../selectors/liveFeedbackChats';
import { getQuestionFlags } from '../../selectors/questionFlags';
import { getQuestions } from '../../selectors/questions';
import { getSubmission } from '../../selectors/submissions';
import translations from '../../translations';

interface ChatInputAreaProps {
  answerId: number;
  questionId: number;
  syncStatus: keyof typeof SYNC_STATUS;
}

const ChatInputArea: FC<ChatInputAreaProps> = (props) => {
  const { answerId, questionId, syncStatus } = props;
  const [input, setInput] = useState('');

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);

  const question = questions[questionId];
  const submissionId = getSubmissionId();
  const questionFlags = useAppSelector(getQuestionFlags);
  const liveFeedbackChatsForAnswer = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );

  const { graderView } = submission;
  const { attemptsLeft } = question;
  const { isResetting } = questionFlags[questionId] || {};

  const currentThreadId = liveFeedbackChatsForAnswer?.currentThreadId;
  const isCurrentThreadExpired =
    liveFeedbackChatsForAnswer?.isCurrentThreadExpired;

  const isRequestingLiveFeedback =
    liveFeedbackChatsForAnswer?.isRequestingLiveFeedback ?? false;
  const isPollingLiveFeedback =
    (liveFeedbackChatsForAnswer?.pendingFeedbackToken ?? false) !== false;
  const suggestions = liveFeedbackChatsForAnswer?.suggestions ?? [];

  const isGetHelpUsageLimited =
    liveFeedbackChatsForAnswer &&
    typeof liveFeedbackChatsForAnswer.maxMessages === 'number';
  const isOutOfMessages =
    isGetHelpUsageLimited &&
    liveFeedbackChatsForAnswer.sentMessages >=
      liveFeedbackChatsForAnswer.maxMessages!;

  const textFieldDisabled =
    isResetting ||
    isRequestingLiveFeedback ||
    isPollingLiveFeedback ||
    !currentThreadId ||
    isCurrentThreadExpired ||
    syncStatus === SYNC_STATUS.Failed ||
    isOutOfMessages ||
    (!graderView && attemptsLeft === 0);

  const sendButtonDisabled = textFieldDisabled || input.trim() === '';

  const sendMessage = (): void => {
    dispatch(sendPromptFromStudent({ answerId, message: input }));
    dispatch(
      generateLiveFeedback({
        submissionId,
        answerId,
        threadId: currentThreadId,
        message: input,
        errorMessage: t(translations.requestFailure),
        options: suggestions.map((option) => option.index),
        optionId: null,
      }),
    );
    setInput('');
  };

  const handlePressEnter = (): void => {
    if (sendButtonDisabled) return;

    sendMessage();
  };

  return (
    <div className="flex flex-end px-2 pb-2 w-full items-center justify-between gap-3">
      <TextField
        disabled={textFieldDisabled}
        fullWidth
        multiline
        onChange={(e) => setInput(e.target.value)}
        onPressEnter={handlePressEnter}
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
