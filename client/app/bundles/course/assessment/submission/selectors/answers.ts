import { AppState } from 'store';
import { AnswerData } from 'types/course/assessment/submission/answer';

import { AnswerState } from '../types';

const getLocalState = (state: AppState): AnswerState => {
  return state.assessments.submission.answers;
};

export const getInitialAnswer = (
  state: AppState,
): Record<number, AnswerData> => {
  return getLocalState(state).initial;
};

export const getClientVersionForAnswerId = (
  state: AppState,
  answerId: number,
): number => {
  return getLocalState(state).clientVersionByAnswerId[answerId];
};
