import { AppState } from 'store';

import { QuestionsState } from '../types';

const getLocalState = (state: AppState): QuestionsState => {
  return state.assessments.submission.questions;
};

export const getQuestions = (state: AppState): QuestionsState => {
  return getLocalState(state);
};
