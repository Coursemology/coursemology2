import { AxiosError } from 'axios';
import {
  RubricAnswerData,
} from 'types/course/rubrics';

import CourseAPI from 'api/course';

export const fetchQuestionRubricAnswers = async (): Promise<
  RubricAnswerData[]
> => {
  try {
    const response = await CourseAPI.assessment.question.rubrics.answers();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};
