import { AppState } from 'store';

import { LiveFeedback, LiveFeedbackState } from '../types';

const getLocalState = (state: AppState): LiveFeedbackState => {
  return state.assessments.submission.liveFeedback;
};

export const getLiveFeedbacks = (state: AppState): LiveFeedbackState => {
  return getLocalState(state);
};

export const getFeedbackByQuestionId = (
  state: AppState,
  questionId: number,
): LiveFeedback => getLiveFeedbacks(state)?.feedbackByQuestion[questionId];
