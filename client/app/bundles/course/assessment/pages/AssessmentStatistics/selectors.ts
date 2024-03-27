import { AppState } from 'store';
import { AssessmentStatisticsState } from 'types/course/statistics/assessmentStatistics';

export const getAssessmentStatistics = (
  state: AppState,
): AssessmentStatisticsState => state.assessments.statistics;
