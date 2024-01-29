import { AppState } from 'store';
import { AssessmentStatisticsStore } from 'types/course/statistics/assessmentStatistics';

export const getAssessmentStatistics = (
  state: AppState,
): AssessmentStatisticsStore => state.assessments.statistics;
