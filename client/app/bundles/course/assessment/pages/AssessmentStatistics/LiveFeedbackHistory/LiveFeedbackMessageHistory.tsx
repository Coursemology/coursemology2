import { Dispatch, FC, SetStateAction } from 'react';
import { Typography } from '@mui/material';
import moment from 'moment';
import { LiveFeedbackChatMessage } from 'types/course/assessment/submission/liveFeedback';

import {
  fetchAllIndexWithIdenticalFileIds,
  justifyPosition,
} from 'course/assessment/submission/components/GetHelpChatPage/utils';
import MarkdownText from 'course/assessment/submission/components/MarkdownText';
import { SHORT_DATE_TIME_FORMAT } from 'lib/moment';

interface Props {
  messages: LiveFeedbackChatMessage[];
  selectedMessageIndex: number;
  setSelectedMessageIndex: Dispatch<SetStateAction<number>>;
}

const LiveFeedbackMessageHistory: FC<Props> = (props) => {
  const { messages, selectedMessageIndex, setSelectedMessageIndex } = props;

  const allChosenMessageIndex = fetchAllIndexWithIdenticalFileIds(
    messages,
    selectedMessageIndex,
  );

  return (
    <>
      {messages.map((message, index) => {
        const isStudent = message.creatorId !== 0;
        const isError = message.isError;
        const createdAt = moment(new Date(message.createdAt)).format(
          SHORT_DATE_TIME_FORMAT,
        );

        return (
          <div
            key={message.id}
            className={`flex ${justifyPosition(isStudent, isError)} ${allChosenMessageIndex[index] && 'bg-green-200'}`}
            id={`message-${message.id}`}
          >
            <div
              className={`flex flex-col rounded-lg ${isStudent ? 'bg-blue-200' : 'bg-gray-200'} max-w-[70%] pt-3 pl-3 pr-3 pb-2 m-2 w-fit text-wrap break-words space-y-1 hover:cursor-pointer`}
              onClick={() => setSelectedMessageIndex(index)}
            >
              <MarkdownText content={`${message.content}`} />
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
    </>
  );
};

export default LiveFeedbackMessageHistory;
