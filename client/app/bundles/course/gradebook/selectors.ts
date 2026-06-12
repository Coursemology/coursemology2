import type { AppState } from 'store';

type GradebookState = AppState['gradebook'];

function getLocalState(state: AppState): GradebookState {
  return state.gradebook;
}

export const getCategories = (state: AppState): GradebookState['categories'] =>
  getLocalState(state).categories;
export const getTabs = (state: AppState): GradebookState['tabs'] =>
  getLocalState(state).tabs;
export const getAssessments = (
  state: AppState,
): GradebookState['assessments'] => getLocalState(state).assessments;
export const getStudents = (state: AppState): GradebookState['students'] =>
  getLocalState(state).students;
export const getSubmissions = (
  state: AppState,
): GradebookState['submissions'] => getLocalState(state).submissions;
export const getGamificationEnabled = (
  state: AppState,
): GradebookState['gamificationEnabled'] =>
  getLocalState(state).gamificationEnabled;
export const getWeightedViewEnabled = (state: AppState): boolean =>
  getLocalState(state).weightedViewEnabled;
export const getCanManageWeights = (state: AppState): boolean =>
  getLocalState(state).canManageWeights;
