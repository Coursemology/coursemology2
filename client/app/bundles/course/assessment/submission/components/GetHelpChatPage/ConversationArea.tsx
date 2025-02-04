import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
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
  onFeedbackClick: (linenum: number, filename?: string) => void;
  answerId: number;
}

const ConversationArea: FC<ConversationAreaProps> = (props) => {
  const { onFeedbackClick, answerId } = props;

  const { control } = useFormContext();
  const currentAnswer = useWatch({ control });

  const files = currentAnswer[answerId]
    ? currentAnswer[answerId].files_attributes ||
      currentAnswer[`${answerId}`].files_attributes
    : [];

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
        const allMessages = [...chat.message];
        if (allMessages.length === 0) return null;

        const firstMessage = allMessages[0];
        const nextMessages = allMessages.slice(1, allMessages.length);

        return (
          <div
            key={`${firstMessage} ${chat.createdAt}`}
            className={`flex ${justifyPosition(isStudent, chat.isError)}`}
            id={`chat-${answerId}-${index}`}
          >
            <div
              className={`flex flex-col rounded-lg ${isStudent ? 'bg-blue-200' : 'bg-gray-200'} max-w-[70%] pt-3 pl-3 pr-3 pb-2 m-2 w-fit text-wrap break-words space-y-1`}
            >
              {chat.lineContent && chat.lineNumber && (
                <div
                  className={`flex flex-col ${chat.lineNumber && 'cursor-pointer'} rounded-lg bg-gray-50 hover:bg-gray-100 p-3 w-full text-wrap break-words`}
                  onClick={() => {
                    if (chat.lineNumber) {
                      onFeedbackClick(chat.lineNumber, chat.filename);
                    }
                  }}
                >
                  <Typography
                    className="flex flex-col whitespace-pre-wrap ml-1"
                    variant="body2"
                  >
                    {files.length === 1
                      ? t(translations.lineNumber, {
                          lineNumber: chat.lineNumber,
                        })
                      : t(translations.fileNameAndLineNumber, {
                          filename: chat.filename ?? '',
                          lineNumber: chat.lineNumber,
                        })}
                  </Typography>
                  <MarkdownText content={`${chat.lineContent}`} />
                </div>
              )}

              <MarkdownText content={`${firstMessage}`} />
              {nextMessages.map((nextMessage) => (
                <MarkdownText key={nextMessage} content={`${nextMessage}`} />
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
