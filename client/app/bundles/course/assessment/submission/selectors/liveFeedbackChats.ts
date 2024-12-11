import { EntityState } from '@reduxjs/toolkit';
import { AppState } from 'store';

import { liveFeedbackChatAdapter } from '../reducers/liveFeedbackChats';
import { LiveFeedbackChatData } from '../types';

const getLocalState = (state: AppState): EntityState<LiveFeedbackChatData> => {
  return state.assessments.submission.liveFeedbackChats
    .liveFeedbackChatPerQuestion;
};

const liveFeedbackChatsSelector =
  liveFeedbackChatAdapter.getSelectors<AppState>(getLocalState);

export const getLiveFeedbackChatsForQuestionId = (
  state: AppState,
  questionId: number | null,
): LiveFeedbackChatData | undefined => {
  return questionId
    ? liveFeedbackChatsSelector.selectById(state, questionId)
    : undefined;
};
