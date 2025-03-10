import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LiveFeedbackHistoryState } from 'types/course/assessment/submission/liveFeedback';

const initialState: LiveFeedbackHistoryState = {
  messages: [],
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
      state.messages = action.payload.messages;
      state.question = action.payload.question;
    },
    reset: () => {
      return initialState;
    },
  },
});

export const liveFeedbackActions = liveFeedbackSlice.actions;

export default liveFeedbackSlice.reducer;
