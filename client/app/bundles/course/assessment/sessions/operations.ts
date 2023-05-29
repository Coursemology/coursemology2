import { AxiosError } from 'axios';
import {
  SessionFormData,
  SessionFormPostData,
} from 'types/course/assessment/sessions';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

export const createAssessmentSession = async (
  data: SessionFormData,
): Promise<JustRedirect> => {
  const adaptedData: SessionFormPostData = {
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
