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

// Rubric category grades now live in the gradingResults slice (keyed by question id) alongside the other
// auto grading results, not in the answers slice.
export const getRubricCategoryGrades = (
  state: AppState,
): Record<number, CategoryGradeType[]> => {
  return state.assessments.submission.gradingResults.categoryGrades;
};

export const getRubricCategoryGradesForQuestionId = (
  state: AppState,
  questionId: number,
): CategoryGradeType[] | undefined => {
  return state.assessments.submission.gradingResults.categoryGrades[questionId];
};
