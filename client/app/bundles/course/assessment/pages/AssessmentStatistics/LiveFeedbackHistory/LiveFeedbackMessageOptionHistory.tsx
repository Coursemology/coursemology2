import { FC } from 'react';
import { Button } from '@mui/material';
import {
  LiveFeedbackChatMessage,
  MessageOption,
} from 'types/course/assessment/submission/liveFeedback';

import {
  suggestionFixesMapping,
  suggestionMapping,
} from 'course/assessment/submission/suggestionTranslations';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  curMessage: LiveFeedbackChatMessage;
  options: MessageOption[];
}

const LiveFeedbackMessageOptionHistory: FC<Props> = (props) => {
  const { curMessage, options } = props;

  const { t } = useTranslation();

  return (
    <div className="scrollbar-hidden absolute bottom-full flex px-1.5 py-0.5 gap-2 w-full overflow-x-auto">
      {options.map((option) => {
        const optionDetail =
          option.optionType === 'suggestion'
            ? suggestionMapping[option.optionId]
            : suggestionFixesMapping[option.optionId];

        return (
          <Button
            key={option.optionId}
            className={`${curMessage.optionId === option.optionId ? 'bg-blue-300' : 'bg-white'} text-black text-xl shrink-0 mb-2`}
            disabled
            variant="outlined"
          >
            {t({
              id: optionDetail.id,
              defaultMessage: optionDetail.defaultMessage,
            })}
          </Button>
        );
      })}
    </div>
  );
};

export default LiveFeedbackMessageOptionHistory;
