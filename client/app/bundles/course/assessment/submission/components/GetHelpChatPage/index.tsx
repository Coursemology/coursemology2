import { FC, useEffect, useRef, useState } from 'react';
import { Divider, Paper } from '@mui/material';

import { GET_HELP_SYNC_STATUS } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';

import { getLiveFeedbackChatsForQuestionId } from '../../selectors/liveFeedbackChats';

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
    getLiveFeedbackChatsForQuestionId(state, questionId),
  );

  const [syncStatus, setSyncStatus] = useState<
    keyof typeof GET_HELP_SYNC_STATUS
  >(GET_HELP_SYNC_STATUS.Syncing);

  const isRequestingLiveFeedback = liveFeedbackChats?.isRequestingLiveFeedback;
  const isPollingLiveFeedback = liveFeedbackChats?.pendingFeedbackToken;

  const isRenderingSuggestionChips =
    !isRequestingLiveFeedback &&
    !isPollingLiveFeedback &&
    liveFeedbackChats?.currentThreadId;

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
      <Header
        questionId={questionId}
        setSyncStatus={setSyncStatus}
        syncStatus={syncStatus}
      />

      <Divider />

      <div ref={scrollableRef} className="flex-1 overflow-auto mt-1">
        <ConversationArea
          onFeedbackClick={onFeedbackClick}
          questionId={questionId}
        />
      </div>

      <div className="relative flex flex-row items-center">
        {isRenderingSuggestionChips && (
          <SuggestionChips
            answerId={answerId}
            questionId={questionId}
            syncStatus={syncStatus}
          />
        )}
        <ChatInputArea
          answerId={answerId}
          questionId={questionId}
          syncStatus={syncStatus}
        />
      </div>
    </Paper>
  );
};

export default GetHelpChatPage;
