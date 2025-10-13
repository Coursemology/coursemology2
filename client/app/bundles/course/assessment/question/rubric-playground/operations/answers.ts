import { AxiosError } from 'axios';
import {
  RubricAnswerData,
  RubricEvaluationData,
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

export const evaluatePlaygroundAnswer = async (
  rubricId: number,
  answerId: number,
): Promise<RubricEvaluationData> => {
  try {
    const response =
      await CourseAPI.assessment.question.rubrics.evaluateAnswer(
        rubricId,
        answerId,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};
