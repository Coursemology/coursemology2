import { Dispatch, FC, SetStateAction, useEffect, useRef } from 'react';
import { defineMessages } from 'react-intl';
import { Divider, Paper, Typography } from '@mui/material';
import { LiveFeedbackChatMessage } from 'types/course/assessment/submission/liveFeedback';

import useTranslation from 'lib/hooks/useTranslation';

import LiveFeedbackMessageHistory from './LiveFeedbackMessageHistory';
import LiveFeedbackMessageOptionHistory from './LiveFeedbackMessageOptionHistory';

interface Props {
  messages: LiveFeedbackChatMessage[];
  selectedMessageIndex: number;
  setSelectedMessageIndex: Dispatch<SetStateAction<number>>;
}

const translations = defineMessages({
  getHelpHeader: {
    id: 'course.assessment.submission.GetHelpChatPage',
    defaultMessage: 'Get Help',
  },
});

const MESSAGE_OFFSET = 40;

const LiveFeedbackConversation: FC<Props> = (props) => {
  const { messages, selectedMessageIndex, setSelectedMessageIndex } = props;

  const scrollableRef = useRef<HTMLDivElement>(null);

  const curMessage = messages[selectedMessageIndex];

  const options = [...curMessage.options];

  options.sort(
    (option1, option2) =>
      (curMessage.optionId === option1.optionId ? 0 : 1) -
      (curMessage.optionId === option2.optionId ? 0 : 1),
  );

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const selectedMessageId = curMessage.id;
    const targetMessage = document.getElementById(
      `message-${selectedMessageId}`,
    );

    if (targetMessage && scrollableRef.current) {
      scrollableRef.current.scrollTo({
        top: targetMessage.offsetTop - MESSAGE_OFFSET,
      });
    }
  }, [curMessage]);

  const { t } = useTranslation();

  return (
    <Paper className="flex flex-col w-full mb-2" variant="outlined">
      <div className="flex-none p-1 flex items-center justify-between">
        <Typography className="pl-2" variant="h6">
          {t(translations.getHelpHeader)}
        </Typography>
      </div>

      <Divider />

      <div
        ref={scrollableRef}
        className={`flex-1 overflow-auto ${curMessage.options.length > 0 && 'pb-14'}`}
      >
        <LiveFeedbackMessageHistory
          messages={messages}
          selectedMessageIndex={selectedMessageIndex}
          setSelectedMessageIndex={setSelectedMessageIndex}
        />
      </div>

      <div className="relative flex flex-row items-center">
        <LiveFeedbackMessageOptionHistory
          curMessage={curMessage}
          options={options}
        />
      </div>
    </Paper>
  );
};

export default LiveFeedbackConversation;
