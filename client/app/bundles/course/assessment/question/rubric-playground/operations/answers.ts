import { AxiosError } from 'axios';
import {
  RubricAnswerData,
  RubricAnswerEvaluationData,
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

export const initializeAnswerEvaluations = async (
  rubricId: number,
  answerIds: number[],
): Promise<RubricAnswerEvaluationData[]> => {
  if (!answerIds.length) return [];

  try {
    const response =
      await CourseAPI.assessment.question.rubrics.initializeAnswerEvaluations(
        rubricId,
        answerIds,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const evaluatePlaygroundAnswer = async (
  rubricId: number,
  answerId: number,
): Promise<RubricAnswerEvaluationData> => {
  try {
    const response = await CourseAPI.assessment.question.rubrics.evaluateAnswer(
      rubricId,
      answerId,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const fetchRubricAnswerEvaluations = async (
  rubricId: number,
): Promise<RubricAnswerEvaluationData[]> => {
  try {
    const response =
      await CourseAPI.assessment.question.rubrics.fetchAnswerEvaluations(
        rubricId,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const deleteAnswerEvaluation = async (
  rubricId: number,
  answerId: number,
): Promise<void> => {
  try {
    await CourseAPI.assessment.question.rubrics.deleteAnswerEvaluation(
      rubricId,
      answerId,
    );
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};
