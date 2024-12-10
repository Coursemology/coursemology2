import { FC } from 'react';
import { Button } from '@mui/material';

import { GET_HELP_SYNC_STATUS } from 'lib/constants/sharedConstants';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { generateLiveFeedback } from '../../actions/answers';
import { sendPromptFromStudent } from '../../reducers/liveFeedbackChats';
import { getLiveFeedbackChatsForQuestionId } from '../../selectors/liveFeedbackChats';
import translations from '../../translations';

interface SuggestionChipsProps {
  answerId: number;
  questionId: number;
  syncStatus: keyof typeof GET_HELP_SYNC_STATUS;
}

const SuggestionChips: FC<SuggestionChipsProps> = (props) => {
  const { answerId, questionId, syncStatus } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const submissionId = getSubmissionId();

  const liveFeedbackChatsForQuestion = useAppSelector((state) =>
    getLiveFeedbackChatsForQuestionId(state, questionId),
  );
  const currentThreadId = liveFeedbackChatsForQuestion?.currentThreadId;

  const suggestions = liveFeedbackChatsForQuestion?.suggestions ?? [];

  const sendHelpRequest = (message: string): void => {
    dispatch(sendPromptFromStudent({ submissionId, questionId, message }));
    dispatch(
      generateLiveFeedback({
        submissionId,
        answerId,
        threadId: currentThreadId,
        message,
        questionId,
        errorMessage: t(translations.requestFailure),
      }),
    );
  };

  return (
    <div className="scrollbar-hidden absolute bottom-full flex p-1 gap-3 w-full overflow-x-auto">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.id}
          className="bg-white"
          disabled={syncStatus === GET_HELP_SYNC_STATUS.Failed}
          onClick={() => sendHelpRequest(t(suggestion))}
          variant="outlined"
        >
          {t(suggestion)}
        </Button>
      ))}
    </div>
  );
};

export default SuggestionChips;
