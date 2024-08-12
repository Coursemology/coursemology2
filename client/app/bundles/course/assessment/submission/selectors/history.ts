import { AppState } from 'store';

import { HistoryAnswer, HistoryQuestion, HistoryState } from '../types';

const getLocalState = (state: AppState): HistoryState => {
  return state.assessments.submission.history;
};

export const getHistoryAnswers = (
  state: AppState,
): Record<number, HistoryAnswer> => {
  return getLocalState(state).answers;
};

export const getHistoryQuestions = (
  state: AppState,
): Record<number, HistoryQuestion> => {
  return getLocalState(state).questions;
};
