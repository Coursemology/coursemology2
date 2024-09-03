import { AppState } from 'store';
import {
  LiveFeedbackHistory,
  QuestionInfo,
} from 'types/course/assessment/submission/liveFeedback';
import { AssessmentStatisticsState } from 'types/course/statistics/assessmentStatistics';

export const getAssessmentStatistics = (
  state: AppState,
): AssessmentStatisticsState => state.assessments.statistics;

export const getLiveFeedbackHistory = (
  state: AppState,
): LiveFeedbackHistory[] => state.assessments.liveFeedback.liveFeedbackHistory;

export const getLiveFeedbadkQuestionInfo = (state: AppState): QuestionInfo =>
  state.assessments.liveFeedback.question;
