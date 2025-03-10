import { AppState } from 'store';
import {
  LiveFeedbackChatMessage,
  QuestionInfo,
} from 'types/course/assessment/submission/liveFeedback';
import { AssessmentStatisticsState } from 'types/course/statistics/assessmentStatistics';

export const getAssessmentStatistics = (
  state: AppState,
): AssessmentStatisticsState => state.assessments.statistics;

export const getLiveFeedbackChatMessages = (
  state: AppState,
): LiveFeedbackChatMessage[] => state.assessments.liveFeedback.messages;

export const getLiveFeedbadkQuestionInfo = (state: AppState): QuestionInfo =>
  state.assessments.liveFeedback.question;
