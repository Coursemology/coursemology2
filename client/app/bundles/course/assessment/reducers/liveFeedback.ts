import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LiveFeedbackHistoryState } from 'types/course/assessment/submission/liveFeedback';

const initialState: LiveFeedbackHistoryState = {
  liveFeedbackHistory: [],
  question: {
    id: 0,
    title: '',
    description: '',
  },
};

export const liveFeedbackSlice = createSlice({
  name: 'liveFeedbackHistory',
  initialState,
  reducers: {
    initialize: (state, action: PayloadAction<LiveFeedbackHistoryState>) => {
      state.liveFeedbackHistory = action.payload.liveFeedbackHistory;
      state.question = action.payload.question;
    },
    reset: () => {
      return initialState;
    },
  },
});

export const liveFeedbackActions = liveFeedbackSlice.actions;

export default liveFeedbackSlice.reducer;
