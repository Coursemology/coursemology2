import { AppState } from 'store';

import { Explanation } from '../types';

const getLocalState = (state: AppState): Record<number, Explanation> => {
  return state.assessments.submission.explanations;
};

export const getExplanations = (
  state: AppState,
): Record<number, Explanation> => {
  return getLocalState(state);
};
