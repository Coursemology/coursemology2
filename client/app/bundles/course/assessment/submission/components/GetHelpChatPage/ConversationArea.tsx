import { FC } from 'react';
import { Typography } from '@mui/material';

import LoadingEllipsis from 'lib/components/core/LoadingEllipsis';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { getLiveFeedbackChatsForAnswerId } from '../../selectors/liveFeedbackChats';
import translations from '../../translations';
import { ChatSender } from '../../types';

interface ConversationAreaProps {
  onFeedbackClick: (linenum: number) => void;
  answerId: number;
}

const ConversationArea: FC<ConversationAreaProps> = (props) => {
  const { onFeedbackClick, answerId } = props;
  const liveFeedbackChats = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );
  const { t } = useTranslation();

  const isRequestingLiveFeedback = liveFeedbackChats?.isRequestingLiveFeedback;
  const isPollingLiveFeedback = liveFeedbackChats?.pendingFeedbackToken;

  const isRenderingSuggestionChips =
    !isRequestingLiveFeedback && !isPollingLiveFeedback;

  if (!liveFeedbackChats) return null;

  const justifyPosition = (isStudent: boolean, isError: boolean): string => {
    if (isStudent) {
      return 'justify-end';
    }

    if (isError) {
      return 'justify-center';
    }

    return 'justify-start';
  };

  return (
    <div
      className={`flex-1 overflow-auto ${isRenderingSuggestionChips && 'pb-14'}`}
    >
      {liveFeedbackChats.chats.map((chat) => {
        const isStudent = chat.sender === ChatSender.student;
        const allMessages = [...chat.message];
        if (allMessages.length === 0) return null;

        const firstMessage = allMessages[0];
        const nextMessages = allMessages.slice(1, allMessages.length);

        const formattedFirstMessage = chat.lineNumber
          ? t(translations.lineNumberMessage, {
              lineNumber: chat.lineNumber,
              message: firstMessage,
            })
          : firstMessage;
        return (
          <div
            key={`${firstMessage} ${chat.createdAt}`}
            className={`flex ${justifyPosition(isStudent, chat.isError)}`}
          >
            <div
              className={`flex flex-col ${chat.lineNumber && 'cursor-pointer'} rounded-lg ${isStudent ? 'bg-blue-200' : 'bg-gray-200'} max-w-[70%] pt-3 pl-3 pr-3 pb-2 m-2 w-fit text-wrap break-words space-y-1`}
              onClick={() => {
                if (chat.lineNumber) {
                  onFeedbackClick(chat.lineNumber);
                }
              }}
            >
              <Typography
                className={`flex flex-col whitespace-pre-wrap ${isStudent ? 'text-right' : 'text-left'}`}
                variant="body2"
              >
                {formattedFirstMessage}
              </Typography>
              {nextMessages.map((nextMessage) => (
                <Typography
                  key={nextMessage}
                  className={`flex flex-col whitespace-pre-wrap ${isStudent ? 'text-right' : 'text-left'}`}
                  variant="body2"
                >
                  {nextMessage}
                </Typography>
              ))}
              {!chat.isError && (
                <Typography
                  className="flex flex-col text-gray-400 text-right"
                  variant="caption"
                >
                  {chat.createdAt}
                </Typography>
              )}
            </div>
          </div>
        );
      })}
      {(isRequestingLiveFeedback || isPollingLiveFeedback) && (
        <div className="flex justify-start rounded-lg bg-gray-200 w-fit p-3 m-2">
          <LoadingEllipsis />
        </div>
      )}
    </div>
  );
};

export default ConversationArea;
