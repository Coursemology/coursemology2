import { AxiosError } from 'axios';
import { ScholaisticAssessmentUpdateData } from 'types/course/scholaistic';

import CourseAPI from 'api/course';

export const updateScholaisticAssessment = async (
  assessmentId: number,
  data: ScholaisticAssessmentUpdateData,
): Promise<void> => {
  try {
    const response = await CourseAPI.scholaistic.updateAssessment(
      assessmentId,
      { scholaistic_assessment: { base_exp: data.baseExp } },
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
