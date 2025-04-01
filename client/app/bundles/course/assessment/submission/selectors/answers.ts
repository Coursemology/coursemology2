import { AppState } from 'store';
import { AnswerData } from 'types/course/assessment/submission/answer';

import { AnswerState, CategoryGradeType } from '../types';

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

export const getRubricCategoryGrades = (
  state: AppState,
): Record<number, CategoryGradeType[]> => {
  return getLocalState(state).categoryGrades;
};

export const getRubricCategoryGradesForAnswerId = (
  state: AppState,
  answerId: number,
): CategoryGradeType[] => {
  return getLocalState(state).categoryGrades[answerId];
};
