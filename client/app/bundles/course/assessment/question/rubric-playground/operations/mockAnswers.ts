import { AxiosError } from 'axios';
import {
  RubricAnswerData,
  RubricMockAnswerEvaluationData,
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
): Promise<RubricMockAnswerEvaluationData> => {
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

export const fetchRubricMockAnswerEvaluations = async (
  rubricId: number,
): Promise<RubricMockAnswerEvaluationData[]> => {
  try {
    const response =
      await CourseAPI.assessment.question.rubrics.fetchMockAnswerEvaluations(
        rubricId,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const deleteMockAnswerEvaluation = async (
  rubricId: number,
  mockAnswerId: number,
): Promise<void> => {
  try {
    await CourseAPI.assessment.question.rubrics.deleteMockAnswerEvaluation(
      rubricId,
      mockAnswerId,
    );
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};
