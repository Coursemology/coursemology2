import { AppState } from 'store';

import { QuestionFlag } from '../types';

const getLocalState = (state: AppState): Record<number, QuestionFlag> => {
  return state.assessments.submission.questionsFlags;
};

export const getQuestionFlags = (
  state: AppState,
): Record<number, QuestionFlag> => {
  return getLocalState(state);
};
