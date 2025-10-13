import { AxiosError } from 'axios';
import {
  RubricAnswerData,
  RubricEvaluationData,
} from 'types/course/rubrics';

import CourseAPI from 'api/course';

export const createQuestionMockAnswer = async (
  answerText: string,
): Promise<number> => {
  try {
    const response =
      await CourseAPI.assessment.question.mockAnswers.create(answerText);
    return response.data.id;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const fetchQuestionRubricMockAnswers = async (): Promise<
  RubricAnswerData[]
> => {
  try {
    const response = await CourseAPI.assessment.question.mockAnswers.index();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const evaluatePlaygroundMockAnswer = async (
  rubricId: number,
  mockAnswerId: number,
): Promise<RubricEvaluationData> => {
  try {
    const response =
      await CourseAPI.assessment.question.rubrics.evaluateMockAnswer(
        rubricId,
        mockAnswerId,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};
