import { AxiosError } from 'axios';
import { dispatch } from 'store';

import CourseAPI from 'api/course';

import { liveFeedbackActions as actions } from '../reducers/liveFeedback';

export const fetchLiveFeedbackHistory = async (
  assessmentId: number,
  questionId: number,
  courseUserId: number,
  courseId?: number, // Optional, only used for system and instance admin context
  instanceHost?: string, // Optional, used for system admin context
): Promise<void> => {
  try {
    const response =
      await CourseAPI.statistics.assessment.fetchLiveFeedbackHistory(
        assessmentId,
        questionId,
        courseUserId,
        courseId,
        instanceHost,
      );

    const data = response.data;
    dispatch(
      actions.initialize({
        messages: data.messages,
        question: data.question,
      }),
    );
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
