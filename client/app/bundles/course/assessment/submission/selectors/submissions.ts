import { AppState } from 'store';

import { SubmissionState } from '../types';

const getLocalState = (state: AppState): SubmissionState => {
  return state.assessments.submission.submission;
};

export const getSubmission = (state: AppState): SubmissionState => {
  return getLocalState(state);
};
