import { EntityState } from '@reduxjs/toolkit';
import { AppState } from 'store';

import { liveFeedbackChatAdapter } from '../reducers/liveFeedbackChats';
import { LiveFeedbackChatData } from '../types';

const getLocalState = (state: AppState): EntityState<LiveFeedbackChatData> => {
  return state.assessments.submission.liveFeedbackChats
    .liveFeedbackChatPerAnswer;
};

const liveFeedbackChatsSelector =
  liveFeedbackChatAdapter.getSelectors<AppState>(getLocalState);

export const getLiveFeedbackChatsForAnswerId = (
  state: AppState,
  answerId: number | null,
): LiveFeedbackChatData | undefined => {
  return answerId
    ? liveFeedbackChatsSelector.selectById(state, answerId)
    : undefined;
};
