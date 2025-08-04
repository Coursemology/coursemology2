import { FC, useRef, useState } from 'react';

import { useAppSelector } from 'lib/hooks/store';
import { formatLongDateTime } from 'lib/moment';

import {
  getLiveFeedbackChatMessages,
  getLiveFeedbackEndOfConversationFiles,
} from '../selectors';

import GetHelpSlider from './GetHelpSlider';
import LiveFeedbackConversation from './LiveFeedbackConversation';
import LiveFeedbackFiles from './LiveFeedbackFiles';

const LiveFeedbackDetails: FC = () => {
  const messages = useAppSelector(getLiveFeedbackChatMessages);
  const endOfConversationFiles = useAppSelector(
    getLiveFeedbackEndOfConversationFiles,
  );

  // Create user messages and their indices
  const userMessagesWithIndices = messages
    .map((message, index) => ({ message, index }))
    .filter(({ message }) => message.creatorId !== 0);
  const userMessages = userMessagesWithIndices.map(({ message }) => message);
  const userMessageToActualIndex = userMessagesWithIndices.map(
    ({ index }) => index,
  );

  // Only show markers for messages from human users
  const messageTimeMarkers = userMessages
    .map((message, idx) => {
      return {
        value: userMessageToActualIndex[idx],
        label:
          idx === 0 || idx === userMessages.length - 1
            ? formatLongDateTime(message.createdAt)
            : '',
      };
    })
    .filter(
      (marker): marker is { value: number; label: string } => marker !== null,
    ); // Remove null entries

  const scrollableRef = useRef<HTMLDivElement>(null);

  // SelectedMessageIndex is always the index of the message in the full messages array
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(
    userMessageToActualIndex[userMessages.length - 1],
  );

  const [isConversationEndSelected, setIsConversationEndSelected] =
    useState(false);

  const latestMessageMarker = messageTimeMarkers[messageTimeMarkers.length - 1];
  const earliestMessageMarker = messageTimeMarkers[0];

  const selectedMessageFiles =
    isConversationEndSelected && endOfConversationFiles
      ? endOfConversationFiles
      : messages[selectedMessageIndex].files;

  return (
    <>
      {userMessages.length > 1 && (
        <div className="w-[calc(100%_-_17rem)] mx-auto pt-8">
          <GetHelpSlider
            marks={messageTimeMarkers}
            max={latestMessageMarker.value}
            min={earliestMessageMarker.value}
            onChange={(_, value) => {
              const newIndex = value as number;
              setSelectedMessageIndex(newIndex);
            }}
            step={null}
            value={selectedMessageIndex}
            valueLabelDisplay="on"
            valueLabelFormat={(value) => {
              const userMessageIndex = userMessageToActualIndex.indexOf(value);
              return `${formatLongDateTime(messageTimeMarkers[userMessageIndex].label)} (${userMessageIndex + 1} of ${userMessages.length})`;
            }}
          />
        </div>
      )}

      <div className="flex flex-row w-full relative min-h-[52.5rem]">
        <div className="absolute w-1/2 top-0 bottom-0 left-0 pr-1 flex">
          {selectedMessageFiles.map((file) => (
            <LiveFeedbackFiles
              key={`${isConversationEndSelected ? 'end' : ''}_${messages[selectedMessageIndex].id}_${file.id}`}
              file={file}
            />
          ))}
        </div>

        <div
          ref={scrollableRef}
          className="absolute w-1/2 top-0 bottom-0 right-0 pl-1 flex"
        >
          <LiveFeedbackConversation
            isConversationEndSelectable={Boolean(endOfConversationFiles)}
            isConversationEndSelected={isConversationEndSelected}
            messages={messages}
            selectedMessageIndex={selectedMessageIndex}
            setIsConversationEndSelected={setIsConversationEndSelected}
            setSelectedMessageIndex={setSelectedMessageIndex}
          />
        </div>
      </div>
    </>
  );
};

export default LiveFeedbackDetails;
