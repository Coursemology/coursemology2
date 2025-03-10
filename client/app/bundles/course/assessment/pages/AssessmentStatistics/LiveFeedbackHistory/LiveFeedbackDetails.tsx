import { FC, useState } from 'react';
import { Typography } from '@mui/material';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

import { getLiveFeedbackChatMessages } from '../selectors';
import translations from '../translations';

import LiveFeedbackConversation from './LiveFeedbackConversation';
import LiveFeedbackFiles from './LiveFeedbackFiles';

const LiveFeedbackDetails: FC = () => {
  const { t } = useTranslation();

  const messages = useAppSelector(getLiveFeedbackChatMessages);

  const [selectedMessageIndex, setSelectedMessageIndex] = useState(
    messages.length - 1,
  );

  return (
    <>
      <Typography className="py-2" variant="h6">
        {t(translations.messageTimingTitle, {
          usedAt: formatLongDateTime(messages[selectedMessageIndex].createdAt),
        })}
      </Typography>

      <div className="flex flex-row w-full relative min-h-[52.5rem] space-x-2">
        <div className="absolute max-h-full flex w-1/2 whitespace-nowrap left-0 flex-col mb-2 flex-1 overflow-auto mt-1">
          {messages[selectedMessageIndex].files.map((file) => (
            <LiveFeedbackFiles
              key={`${messages[selectedMessageIndex].id} ${file.id}`}
              file={file}
            />
          ))}
        </div>

        <div className="absolute max-h-[100%] flex w-1/2 whitespace-nowrap right-0">
          <LiveFeedbackConversation
            messages={messages}
            selectedMessageIndex={selectedMessageIndex}
            setSelectedMessageIndex={setSelectedMessageIndex}
          />
        </div>
      </div>
    </>
  );
};

export default LiveFeedbackDetails;
