import { AppState } from 'store';

import { LiveFeedbackState } from '../types';

const getLocalState = (state: AppState): LiveFeedbackState => {
  return state.assessments.submission.liveFeedback;
};

export const getLiveFeedbacks = (state: AppState): LiveFeedbackState => {
  return getLocalState(state);
};
