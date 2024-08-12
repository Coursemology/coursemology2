import { AppState } from 'store';

import { GradeWithPrefilledStatus, GradingState } from '../types';

const getLocalState = (state: AppState): GradingState => {
  return state.assessments.submission.grading;
};

export const getExperiencePoints = (state: AppState): number => {
  return getLocalState(state).exp;
};

export const getQuestionWithGrades = (
  state: AppState,
): Record<number, GradeWithPrefilledStatus> => {
  return getLocalState(state).questions;
};

export const getExpMultiplier = (state: AppState): number => {
  return getLocalState(state).expMultiplier;
};

export const getBasePoints = (state: AppState): number => {
  return getLocalState(state).basePoints;
};

export const getMaximumGrade = (state: AppState): number => {
  return getLocalState(state).maximumGrade;
};
