import { AppState } from 'store';

import { AnswerHistory, QuestionHistory } from '../reducers/history/types';
import { HistoryState } from '../types';

const getLocalState = (state: AppState): HistoryState => {
  return state.assessments.submission.history;
};

export const getHistoryAnswers = (
  state: AppState,
): Record<number, AnswerHistory> => {
  return getLocalState(state).answers;
};

export const getHistoryQuestions = (
  state: AppState,
): Record<number, QuestionHistory> => {
  return getLocalState(state).questions;
};
