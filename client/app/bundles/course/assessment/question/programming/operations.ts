import { AxiosError } from 'axios';
import {
  ProgrammingFormData,
  ProgrammingPostStatusData,
} from 'types/course/assessment/question/programming';

import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/jobHelpers';

const EVALUATION_INTERVAL_MS = 500 as const;

const ProgrammingAPI = CourseAPI.assessment.question.programming;

export const fetchNew = async (): Promise<ProgrammingFormData> => {
  const response = await ProgrammingAPI.fetchNew();
  return response.data;
};

export const fetchEdit = async (id: number): Promise<ProgrammingFormData> => {
  const response = await ProgrammingAPI.fetchEdit(id);
  return response.data;
};

export const create = async (
  data: FormData,
): Promise<ProgrammingPostStatusData> => {
  try {
    const response = await ProgrammingAPI.create(data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors);

    throw error;
  }
};

export const update = async (
  id: number,
  data: FormData,
): Promise<ProgrammingPostStatusData> => {
  try {
    const response = await ProgrammingAPI.update(id, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data?.errors);

    throw error;
  }
};

export const watchEvaluation = (
  url: string,
  onSuccess: () => void,
  onError: (message: string) => void,
): void =>
  pollJob(
    url,
    onSuccess,
    (error) => onError(error.message),
    EVALUATION_INTERVAL_MS,
  );
