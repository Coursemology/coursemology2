import { Dispatch, FC, MouseEventHandler, SetStateAction } from 'react';
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
  isConversationEndSelectable: boolean;
  isConversationEndSelected: boolean;
  setIsConversationEndSelected: Dispatch<SetStateAction<boolean>>;
}

const translations = defineMessages({
  codeUpdated: {
    id: 'course.assessment.submission.GetHelpChatPage.codeUpdated',
    defaultMessage: 'Code Updated',
  },
  endOfConversation: {
    id: 'course.assessment.submission.GetHelpChatPage.endOfConversation',
    defaultMessage: 'View code after conversation',
  },
});

interface MessageGroupDividerProps {
  className: string;
  onClick: MouseEventHandler;
  label: string;
}

const MessageGroupDivider: FC<MessageGroupDividerProps> = (props) => {
  return (
    <div className="my-2 flex justify-center">
      <Chip
        className={props.className}
        color="primary"
        label={props.label}
        onClick={props.onClick}
        size="small"
        variant="filled"
      />
    </div>
  );
};

const LiveFeedbackMessageHistory: FC<Props> = (props) => {
  const {
    messages,
    selectedMessageIndex,
    setSelectedMessageIndex,
    onMessageClick,
    isConversationEndSelected,
    isConversationEndSelectable,
    setIsConversationEndSelected,
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
      !isConversationEndSelected &&
      (messageIndex === selectedMessageIndex ||
        messageIndex === selectedMessageIndex + 1)
    );
  };

  // Helper function to get divider opacity class
  const getDividerOpacityClass = (groupIndex: number): string => {
    const nextGroup = messageGroups[groupIndex + 1];
    const firstMessageOfNextGroup = nextGroup.indices[0];
    const isFirstMessageActive = isMessageActive(firstMessageOfNextGroup);
    return isFirstMessageActive ? '' : 'opacity-35';
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
                  !isConversationEndSelectable &&
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
                  setIsConversationEndSelected(false);
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
            <MessageGroupDivider
              className={[
                'bg-blue-200 text-black',
                getDividerOpacityClass(groupIndex),
              ]
                .filter(Boolean)
                .join(' ')}
              label={t(translations.codeUpdated)}
              onClick={() => {
                setSelectedMessageIndex(
                  messageGroups[groupIndex + 1].indices[0],
                );
                setIsConversationEndSelected(false);
                onMessageClick(
                  messages[messageGroups[groupIndex + 1].indices[0]].id,
                );
              }}
            />
          )}
        </div>
      ))}
      {isConversationEndSelectable && (
        <MessageGroupDivider
          className={[
            'mb-16 bg-blue-200 text-black',
            isConversationEndSelected ? '' : 'opacity-35',
          ]
            .filter(Boolean)
            .join(' ')}
          label={t(translations.endOfConversation)}
          onClick={() => {
            setSelectedMessageIndex(messages.length - 1);
            setIsConversationEndSelected(true);
          }}
        />
      )}
    </>
  );
};

export default LiveFeedbackMessageHistory;
