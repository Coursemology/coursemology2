import { FC } from 'react';
import { Button } from '@mui/material';

import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { generateLiveFeedback } from '../../actions/answers';
import { sendPromptFromStudent } from '../../reducers/liveFeedbackChats';
import { getLiveFeedbackChatsForAnswerId } from '../../selectors/liveFeedbackChats';
import translations from '../../translations';

interface SuggestionChipsProps {
  answerId: number;
}

const SuggestionChips: FC<SuggestionChipsProps> = (props) => {
  const { answerId } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const submissionId = getSubmissionId();

  const liveFeedbackChatsForAnswer = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );

  const suggestions = liveFeedbackChatsForAnswer?.suggestions ?? [];

  const sendHelpRequest = (message: string): void => {
    dispatch(sendPromptFromStudent({ answerId, message }));
    dispatch(
      generateLiveFeedback({
        submissionId,
        answerId,
        noFeedbackMessage: t(translations.liveFeedbackNoneGenerated),
        errorMessage: t(translations.requestFailure),
      }),
    );
  };

  return (
    <div className="scrollbar-hidden absolute bottom-full flex px-1.5 py-0.5 gap-2 w-full overflow-x-auto">
      {suggestions.map((suggestion) => (
        <Button
          key={suggestion.id}
          className="bg-white text-xl shrink-0"
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
