import { Dispatch, FC, SetStateAction } from 'react';
import { defineMessages } from 'react-intl';
import { Chip, Typography } from '@mui/material';
import { LiveFeedbackChatMessage } from 'types/course/assessment/submission/liveFeedback';

import {
  fetchAllIndexWithIdenticalFileIds,
  groupMessagesByFileIds,
  justifyPosition,
} from 'course/assessment/submission/components/GetHelpChatPage/utils';
import MarkdownText from 'course/assessment/submission/components/MarkdownText';
import useTranslation from 'lib/hooks/useTranslation';
import moment, { SHORT_DATE_TIME_FORMAT } from 'lib/moment';

interface Props {
  messages: LiveFeedbackChatMessage[];
  selectedMessageIndex: number;
  setSelectedMessageIndex: Dispatch<SetStateAction<number>>;
  onMessageClick: (messageId: number) => void;
}

const translations = defineMessages({
  codeUpdated: {
    id: 'course.assessment.submission.GetHelpChatPage.codeUpdated',
    defaultMessage: 'Code Updated',
  },
});

const LiveFeedbackMessageHistory: FC<Props> = (props) => {
  const {
    messages,
    selectedMessageIndex,
    setSelectedMessageIndex,
    onMessageClick,
  } = props;

  const { t } = useTranslation();

  const allChosenMessageIndex = fetchAllIndexWithIdenticalFileIds(
    messages,
    selectedMessageIndex,
  );

  const messageGroups = groupMessagesByFileIds(messages);

  // Helper function to find the most recent user message from the clicked message index
  const findMostRecentUserMessage = (clickedIndex: number): number => {
    for (let i = clickedIndex; i >= 0; i--) {
      const message = messages[i];
      if (message.creatorId !== 0) {
        return i;
      }
    }
    return clickedIndex;
  };

  // Helper function to check if a message index is active
  const isMessageActive = (messageIndex: number): boolean => {
    return (
      messageIndex === selectedMessageIndex ||
      messageIndex === selectedMessageIndex + 1
    );
  };

  // Helper function to get divider opacity class
  const getDividerOpacityClass = (groupIndex: number): string => {
    const lastMessageOfCurrentGroup =
      messageGroups[groupIndex].indices[
        messageGroups[groupIndex].indices.length - 1
      ];
    const nextGroup = messageGroups[groupIndex + 1];
    const firstMessageOfNextGroup = nextGroup.indices[0];

    const isLastMessageActive = isMessageActive(lastMessageOfCurrentGroup);
    const isFirstMessageActive = isMessageActive(firstMessageOfNextGroup);

    return isLastMessageActive || isFirstMessageActive ? '' : 'opacity-35';
  };

  return (
    <>
      {messageGroups.map((group, groupIndex) => (
        <div key={group.groupId}>
          {group.indices.map((messageIndex, indexInGroup) => {
            const message = messages[messageIndex];
            const isStudent = message.creatorId !== 0;
            const isError = message.isError;
            const createdAt = moment(new Date(message.createdAt)).format(
              SHORT_DATE_TIME_FORMAT,
            );

            return (
              <div
                key={message.id}
                className={[
                  'flex',
                  justifyPosition(isStudent, isError),
                  messageIndex === messages.length - 1 &&
                  allChosenMessageIndex[messageIndex]
                    ? 'pb-16'
                    : '',
                  !isMessageActive(messageIndex) ? 'opacity-35' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                id={`message-${message.id}`}
                onClick={() => {
                  const newIndex = findMostRecentUserMessage(messageIndex);
                  setSelectedMessageIndex(newIndex);
                  onMessageClick(messages[newIndex].id);
                }}
              >
                <div
                  className={[
                    'flex flex-col rounded-lg',
                    isStudent ? 'bg-blue-200' : 'bg-gray-200',
                    'max-w-[70%] pt-3 pl-3 pr-3 pb-2 m-2 w-fit text-wrap break-words space-y-1 cursor-pointer',
                  ].join(' ')}
                >
                  <MarkdownText content={message.content} />
                  {!isError && (
                    <Typography
                      className="flex flex-col text-gray-400 text-right"
                      variant="caption"
                    >
                      {createdAt}
                    </Typography>
                  )}
                </div>
              </div>
            );
          })}
          {/* Add divider between groups, except for the last group */}
          {groupIndex < messageGroups.length - 1 && (
            <div className="my-2 flex justify-center">
              <Chip
                className={[
                  'bg-blue-200 text-black',
                  getDividerOpacityClass(groupIndex),
                ]
                  .filter(Boolean)
                  .join(' ')}
                color="primary"
                label={t(translations.codeUpdated)}
                size="small"
                variant="filled"
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default LiveFeedbackMessageHistory;
