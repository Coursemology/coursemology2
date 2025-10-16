import CourseAPI from "api/course";
import { AxiosError } from "axios";
import { JobStatusResponse } from "types/jobs";

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
