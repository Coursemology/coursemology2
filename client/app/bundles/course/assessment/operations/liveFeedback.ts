import { AxiosError } from 'axios';
import { dispatch } from 'store';

import CourseAPI from 'api/course';

import { liveFeedbackActions as actions } from '../reducers/liveFeedback';

export const fetchLiveFeedbackHistory = async (
  assessmentId: number,
  questionId: number,
  courseUserId: number,
): Promise<void> => {
  try {
    const response =
      await CourseAPI.statistics.assessment.fetchLiveFeedbackHistory(
        assessmentId,
        questionId,
        courseUserId,
      );

    const data = response.data;
    dispatch(
      actions.initialize({
        liveFeedbackHistory: data.liveFeedbackHistory,
        question: data.question,
      }),
    );
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
