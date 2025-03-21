import { FC, useEffect, useRef, useState } from 'react';
import { Divider, Paper } from '@mui/material';

import { SYNC_STATUS } from 'lib/constants/sharedConstants';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import fetchLiveFeedbackChat from '../../actions/live_feedback';
import { getLiveFeedbackChatsForAnswerId } from '../../selectors/liveFeedbackChats';
import { ChatSender } from '../../types';

import ChatInputArea from './ChatInputArea';
import ConversationArea from './ConversationArea';
import Header from './Header';
import SuggestionChips from './SuggestionChips';

interface GetHelpChatPageProps {
  answerId: number | null;
  questionId: number;
}

const GetHelpChatPage: FC<GetHelpChatPageProps> = (props) => {
  const { answerId, questionId } = props;

  const scrollableRef = useRef<HTMLDivElement>(null);

  const liveFeedbackChats = useAppSelector((state) =>
    getLiveFeedbackChatsForAnswerId(state, answerId),
  );

  const dispatch = useAppDispatch();

  const [syncStatus, setSyncStatus] = useState<keyof typeof SYNC_STATUS>(
    SYNC_STATUS.Syncing,
  );

  const isLiveFeedbackChatLoaded = liveFeedbackChats?.isLiveFeedbackChatLoaded;
  const currentThreadId = liveFeedbackChats?.currentThreadId;

  const isRequestingLiveFeedback = liveFeedbackChats?.isRequestingLiveFeedback;
  const isPollingLiveFeedback = liveFeedbackChats?.pendingFeedbackToken;

  const isRenderingSuggestionChips =
    !isRequestingLiveFeedback && !isPollingLiveFeedback && currentThreadId;

  useEffect(() => {
    if (!liveFeedbackChats || liveFeedbackChats?.chats.length === 0) return;

    const lastStudentIndex = liveFeedbackChats.chats
      .map((chat, i) => (chat.sender === ChatSender.student ? i : -1))
      .reduce((max, curr) => Math.max(max, curr), -1);

    const targetChat = document.getElementById(
      `chat-${answerId}-${lastStudentIndex}`,
    );
    if (targetChat && scrollableRef.current) {
      scrollableRef.current.scrollTo({
        top: targetChat.offsetTop,
      });
    }
  }, [liveFeedbackChats?.chats]);

  useEffect(() => {
    if (!answerId || !currentThreadId || isLiveFeedbackChatLoaded) return;

    fetchLiveFeedbackChat(dispatch, answerId);
  }, [answerId, isLiveFeedbackChatLoaded, currentThreadId]);

  if (!answerId) return null;

  return (
    <Paper className="flex flex-col w-full mb-2" variant="outlined">
      <Header
        answerId={answerId}
        setSyncStatus={setSyncStatus}
        syncStatus={syncStatus}
      />

      <Divider />

      <div ref={scrollableRef} className="flex-1 overflow-auto mt-1">
        <ConversationArea answerId={answerId} />
      </div>

      <div className="relative flex flex-row items-center">
        {isRenderingSuggestionChips && (
          <SuggestionChips answerId={answerId} syncStatus={syncStatus} />
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
