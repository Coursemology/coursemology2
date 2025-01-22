import { AxiosError } from 'axios';
import { dispatch } from 'store';
import { QuestionType } from 'types/course/assessment/question';
import { SubmissionQuestionDetails } from 'types/course/assessment/submission/submission-question';
import {
  AncestorAssessmentStats,
  AssessmentLiveFeedbackStatistics,
} from 'types/course/statistics/assessmentStatistics';

import CourseAPI from 'api/course';

import { statisticsActions as actions } from '../reducers/statistics';
import { AnswerDataWithQuestion, AnswerDetailsMap } from '../submission/types';

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

export const fetchLiveFeedbackStatistics = async (
  assessmentId: number,
): Promise<AssessmentLiveFeedbackStatistics[]> => {
  const response =
    await CourseAPI.statistics.assessment.fetchLiveFeedbackStatistics(
      assessmentId,
    );
  return response.data;
};
