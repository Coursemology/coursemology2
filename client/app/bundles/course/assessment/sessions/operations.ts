/* eslint-disable import/prefer-default-export */
import { AxiosError } from 'axios';
import { SessionFormData } from 'types/course/assessment/sessions';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

export const createAssessmentSession = async (
  data: SessionFormData,
): Promise<JustRedirect> => {
  const adaptedData = {
    password: data.password,
    submission_id: data.submissionId,
  };

  try {
    const response = await CourseAPI.assessment.sessions.create(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
