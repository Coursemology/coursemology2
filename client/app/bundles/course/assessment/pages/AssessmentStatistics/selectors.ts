/* eslint-disable @typescript-eslint/explicit-function-return-type */
// TODO: define store for statistics page (in next PR)
import { AppState } from 'store';
import { AssessmentStatisticsStore } from 'types/course/statistics/assessmentStatistics';
import { selectEntity } from 'utilities/store';

const getLocalState = (state: AppState) => state.assessments;

export const getStatisticsPage = (state: AppState) =>
  getLocalState(state).statisticsPage;

export const getAssessmentStatistics = (state: AppState) =>
  getLocalState(state).statistics;
