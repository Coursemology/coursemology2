import { AppState } from 'store';

import { AssessmentState } from '../types';

const getLocalState = (state: AppState): AssessmentState => {
  return state.assessments.submission.assessment;
};

export const getAssessment = (state: AppState): AssessmentState => {
  return getLocalState(state);
};
