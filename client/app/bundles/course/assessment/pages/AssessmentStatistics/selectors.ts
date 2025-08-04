import { AppState } from 'store';
import {
  LiveFeedbackChatMessage,
  MessageFile,
  QuestionInfo,
} from 'types/course/assessment/submission/liveFeedback';
import {
  AncestorInfo,
  AssessmentLiveFeedbackStatistics,
  MainAssessmentInfo,
  MainSubmissionInfo,
} from 'types/course/statistics/assessmentStatistics';

export const getAssessmentStatistics = (
  state: AppState,
): MainAssessmentInfo | null =>
  state.assessments.statistics.assessmentStatistics;

export const getSubmissionStatistics = (
  state: AppState,
): MainSubmissionInfo[] => state.assessments.statistics.submissionStatistics;

export const getAncestorInfo = (state: AppState): AncestorInfo[] =>
  state.assessments.statistics.ancestorInfo;

export const getLiveFeedbackStatistics = (
  state: AppState,
): AssessmentLiveFeedbackStatistics[] =>
  state.assessments.statistics.liveFeedbackStatistics;

export const getLiveFeedbackChatMessages = (
  state: AppState,
): LiveFeedbackChatMessage[] => state.assessments.liveFeedback.messages;

export const getLiveFeedbackQuestionInfo = (state: AppState): QuestionInfo =>
  state.assessments.liveFeedback.question;

export const getLiveFeedbackEndOfConversationFiles = (
  state: AppState,
): MessageFile[] | undefined =>
  state.assessments.liveFeedback.endOfConversationFiles;
