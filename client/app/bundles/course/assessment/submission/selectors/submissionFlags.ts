import { AppState } from 'store';

import { SubmissionFlagsState } from '../types';

const getLocalState = (state: AppState): SubmissionFlagsState => {
  return state.assessments.submission.submissionFlags;
};

export const getSubmissionFlags = (state: AppState): SubmissionFlagsState => {
  return getLocalState(state);
};
