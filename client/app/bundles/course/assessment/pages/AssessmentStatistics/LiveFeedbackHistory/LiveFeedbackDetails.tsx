import { FC, useRef, useState } from 'react';
import { Typography } from '@mui/material';

import CustomSlider from 'lib/components/extensions/CustomSlider';
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

  const messageTimeMarkers = messages.map((message, idx) => {
    return {
      value: idx,
      label:
        idx === 0 || idx === messages.length - 1
          ? formatLongDateTime(message.createdAt)
          : '',
    };
  });

  const scrollableRef = useRef<HTMLDivElement>(null);

  const [selectedMessageIndex, setSelectedMessageIndex] = useState(
    messages.length - 1,
  );

  const currentMessageMarker = messageTimeMarkers[selectedMessageIndex];
  const latestMessageMarker = messageTimeMarkers[messageTimeMarkers.length - 1];
  const earliestMessageMarker = messageTimeMarkers[0];

  return (
    <>
      <div className="w-[calc(100%_-_17rem)] mx-auto pt-8">
        <CustomSlider
          defaultValue={currentMessageMarker.value}
          marks={messageTimeMarkers}
          max={latestMessageMarker.value}
          min={earliestMessageMarker.value}
          onChange={(_, value) => {
            const newIndex = value as number;
            setSelectedMessageIndex(newIndex);
          }}
          step={null}
          valueLabelDisplay="on"
          valueLabelFormat={(value) =>
            `${formatLongDateTime(messageTimeMarkers[value].label)} (${value + 1} of ${messages.length})`
          }
        />
      </div>
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

        <div
          ref={scrollableRef}
          className="absolute max-h-full flex w-1/2 whitespace-nowrap right-0"
        >
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
