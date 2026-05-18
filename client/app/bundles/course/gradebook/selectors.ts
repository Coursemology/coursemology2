/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';

const getLocalState = (state: AppState) => state.gradebook;

export const getTabs = (state: AppState) => getLocalState(state).tabs;
export const getAssessments = (state: AppState) =>
  getLocalState(state).assessments;
export const getStudents = (state: AppState) => getLocalState(state).students;
