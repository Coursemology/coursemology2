import { AxiosError } from 'axios';
import { dispatch } from 'store';
import { QuestionType } from 'types/course/assessment/question';
import {
  AncestorAssessmentStats,
  AnswerStatisticsData,
  AssessmentLiveFeedbackStatistics,
  SubmissionQuestionDetails,
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

export const fetchSubmissionQuestionDetails = async (
  submissionId: number,
  questionId: number,
): Promise<SubmissionQuestionDetails> => {
  const response =
    await CourseAPI.statistics.allAnswer.fetchSubmissionQuestionDetails(
      submissionId,
      questionId,
    );

  return response.data;
};

export const fetchAnswer = async (
  answerId: number,
): Promise<AnswerStatisticsData<keyof typeof QuestionType>> => {
  const response = await CourseAPI.statistics.answer.fetch(answerId);

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
