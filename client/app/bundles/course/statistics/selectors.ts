import { AppState } from 'store';

import {
  CoursePerformanceIndex,
  CourseProgressionIndex,
  StaffIndex,
  StatisticsState,
  StudentIndex,
} from './types';

const getLocalState = (state: AppState): StatisticsState => {
  return state.statistics;
};

export const getStudentStatistics = (state: AppState): StudentIndex => {
  return getLocalState(state).studentsStatistics;
};

export const getStaffStatistics = (state: AppState): StaffIndex => {
  return getLocalState(state).staffStatistics;
};

export const getCourseProgressionStatistics = (
  state: AppState,
): CourseProgressionIndex => {
  return getLocalState(state).courseProgressionStatistics;
};

export const getCoursePerformanceStatistics = (
  state: AppState,
): CoursePerformanceIndex => {
  return getLocalState(state).coursePerformanceStatistics;
};
