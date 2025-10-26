import { AxiosError } from 'axios';
import { JobStatusResponse } from 'types/jobs';

import CourseAPI from 'api/course';

export const exportEvaluations = async (
  rubricId: number,
): Promise<JobStatusResponse> => {
  try {
    const response =
      await CourseAPI.assessment.question.rubrics.exportEvaluations(rubricId);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};
