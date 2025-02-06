import { FC } from 'react';
import { Typography } from '@mui/material';

import LoadingEllipsis from 'lib/components/core/LoadingEllipsis';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { resetLiveFeedbackChat } from '../../reducers/liveFeedbackChats';
import { getLiveFeedbackChatsForAnswerId } from '../../selectors/liveFeedbackChats';
import translations from '../../translations';
import { ChatSender } from '../../types';
import MarkdownText from '../MarkdownText';

interface ConversationAreaProps {
  answerId: number;
}

const ConversationArea: FC<ConversationAreaProps> = (props) => {
  const { answerId } = props;

  const dispatch = useAppDispatch();
  const liveFeedbackChats = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );
  const isCurrentThreadExpired = liveFeedbackChats?.isCurrentThreadExpired;
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
      {liveFeedbackChats.chats.map((chat, index) => {
        const isStudent = chat.sender === ChatSender.student;
        const message = chat.message;

        return (
          <div
            key={`${message} ${chat.createdAt}`}
            className={`flex ${justifyPosition(isStudent, chat.isError)}`}
            id={`chat-${answerId}-${index}`}
          >
            <div
              className={`flex flex-col rounded-lg ${isStudent ? 'bg-blue-200' : 'bg-gray-200'} max-w-[70%] pt-3 pl-3 pr-3 pb-2 m-2 w-fit text-wrap break-words space-y-1`}
            >
              <MarkdownText content={`${message}`} />
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
      {isCurrentThreadExpired && (
        <div
          className="justify-self-center cursor-pointer rounded-lg bg-gray-200 pt-3 pl-3 pr-3 pb-2 m-2 w-fit text-wrap break-words hover:underline"
          onClick={() => dispatch(resetLiveFeedbackChat({ answerId }))}
        >
          <Typography
            className="whitespace-pre-wrap text-center"
            variant="body2"
          >
            {t(translations.threadExpired)}
          </Typography>
        </div>
      )}
      {(isRequestingLiveFeedback || isPollingLiveFeedback) && (
        <div className="flex justify-start rounded-lg bg-gray-200 w-fit p-3 m-2">
          <LoadingEllipsis />
        </div>
      )}
    </div>
  );
};

export default ConversationArea;
