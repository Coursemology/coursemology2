import type { AppState } from 'store';

function getLocalState(state: AppState) {
  return state.gradebook;
}

export const getCategories = (state: AppState) => getLocalState(state).categories;
export const getTabs = (state: AppState) => getLocalState(state).tabs;
export const getAssessments = (state: AppState) => getLocalState(state).assessments;
export const getStudents = (state: AppState) => getLocalState(state).students;
export const getSubmissions = (state: AppState) => getLocalState(state).submissions;
