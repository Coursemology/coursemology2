import { AxiosError } from 'axios';
import { dispatch } from 'store';
import { QuestionType } from 'types/course/assessment/question';
import {
  AncestorAssessmentStats,
  AssessmentLiveFeedbackStatistics,
  LatestAnswer,
  QuestionAllAnswerDetails,
  QuestionAnswerDetails,
} from 'types/course/statistics/assessmentStatistics';

import CourseAPI from 'api/course';

import { statisticsActions as actions } from '../reducers/statistics';

export const fetchAssessmentStatistics = async (
  assessmentId: number,
): Promise<void> => {
  try {
    dispatch(actions.reset());
    const response =
      await CourseAPI.statistics.assessment.fetchMainStatistics(assessmentId);
    const data = response.data;
    dispatch(
      actions.initialize({
        assessment: data.assessment,
        submissions: data.submissions,
        ancestors: data.ancestors,
      }),
    );
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const fetchAncestorStatistics = async (
  ancestorId: number,
): Promise<AncestorAssessmentStats> => {
  const response =
    await CourseAPI.statistics.assessment.fetchAncestorStatistics(ancestorId);

  return response.data;
};

export const fetchLatestAnswer = async (
  answerId: number,
): Promise<LatestAnswer<keyof typeof QuestionType>> => {
  const response =
    await CourseAPI.statistics.answer.fetchLatestAnswer(answerId);

  return response.data;
};

export const fetchAttempts = async (
  answerId: number,
  limit: number,
): Promise<QuestionAnswerDetails<keyof typeof QuestionType>> => {
  const response = await CourseAPI.statistics.answer.fetchAttempts(
    answerId,
    limit,
  );

  return response.data;
};

export const fetchAllAttempts = async (
  submissionQuestionId: number,
): Promise<QuestionAllAnswerDetails<keyof typeof QuestionType>> => {
  const response =
    await CourseAPI.statistics.allAnswer.fetchAllAttempts(submissionQuestionId);

  return response.data;
};

export const fetchLiveFeedbackStatistics = async (
  assessmentId: number,
): Promise<AssessmentLiveFeedbackStatistics[]> => {
  const response =
    await CourseAPI.statistics.assessment.fetchLiveFeedbackStatistics(
      assessmentId,
    );
  return response.data;
};
