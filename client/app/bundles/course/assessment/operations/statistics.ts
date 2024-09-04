import { AxiosError } from 'axios';
import { dispatch } from 'store';
import { QuestionType } from 'types/course/assessment/question';
import {
  AncestorAssessmentStats,
  AssessmentLiveFeedbackStatistics,
  QuestionAllAnswerDisplayDetails,
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

export const fetchQuestionAnswerDetails = async (
  answerId: number,
): Promise<QuestionAnswerDetails<keyof typeof QuestionType>> => {
  const response =
    await CourseAPI.statistics.answer.fetchQuestionAnswerDetails(answerId);

  return response.data;
};

export const fetchAllAnswers = async (
  submissionQuestionId: number,
): Promise<QuestionAllAnswerDisplayDetails<keyof typeof QuestionType>> => {
  const response =
    await CourseAPI.statistics.allAnswer.fetchAllAnswers(submissionQuestionId);

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
