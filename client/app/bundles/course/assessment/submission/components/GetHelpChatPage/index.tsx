import { FC, useEffect, useRef } from 'react';
import { Divider, Paper } from '@mui/material';

import { useAppSelector } from 'lib/hooks/store';

import { getLiveFeedbackChatsForAnswerId } from '../../selectors/liveFeedbackChats';

import ChatInputArea from './ChatInputArea';
import ConversationArea from './ConversationArea';
import Header from './Header';
import SuggestionChips from './SuggestionChips';

interface GetHelpChatPageProps {
  onFeedbackClick: (linenum: number) => void;
  answerId: number | null;
  questionId: number;
}

const GetHelpChatPage: FC<GetHelpChatPageProps> = (props) => {
  const { onFeedbackClick, answerId, questionId } = props;

  const scrollableRef = useRef<HTMLDivElement>(null);

  const liveFeedbackChats = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );

  const isRequestingLiveFeedback = liveFeedbackChats?.isRequestingLiveFeedback;
  const isPollingLiveFeedback = liveFeedbackChats?.pendingFeedbackToken;

  const isRenderingSuggestionChips =
    !isRequestingLiveFeedback && !isPollingLiveFeedback;

  useEffect(() => {
    if (scrollableRef.current) {
      const { clientHeight, scrollHeight } = scrollableRef.current;
      if (clientHeight < scrollHeight) {
        scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
      }
    }
  });

  if (!answerId) return null;

  return (
    <Paper className="flex flex-col w-full mb-2" variant="outlined">
      <Header answerId={answerId} />

      <Divider />

      <div ref={scrollableRef} className="flex-1 overflow-auto mt-1">
        <ConversationArea
          answerId={answerId}
          onFeedbackClick={onFeedbackClick}
        />
      </div>

      <div className="relative flex flex-row items-center">
        {isRenderingSuggestionChips && <SuggestionChips answerId={answerId} />}
        <ChatInputArea answerId={answerId} questionId={questionId} />
      </div>
    </Paper>
  );
};

export default GetHelpChatPage;
