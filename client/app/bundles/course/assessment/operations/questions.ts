import { AxiosError } from 'axios';
import { QuestionOrderPostData } from 'types/course/assessment/assessments';
import { McqMrqListData } from 'types/course/assessment/question/multiple-responses';
import { QuestionDuplicationResult } from 'types/course/assessment/questions';
import {
  RubricAnswerData,
  RubricAnswerEvaluationData,
  RubricData,
  RubricMockAnswerEvaluationData,
} from 'types/course/rubrics';
import { JobStatusResponse } from 'types/jobs';

import CourseAPI from 'api/course';

import { RubricHeaderFormData } from '../question/rubric-playground/types';

export const reorderQuestions = async (
  assessmentId: number,
  questionIds: number[],
): Promise<QuestionOrderPostData> => {
  const response = await CourseAPI.assessment.assessments.reorderQuestions(
    assessmentId,
    questionIds,
  );
  return response.data;
};

export const duplicateQuestion = async (
  duplicationUrl: string,
): Promise<QuestionDuplicationResult> => {
  try {
    const response =
      await CourseAPI.assessment.assessments.duplicateQuestion(duplicationUrl);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const deleteQuestion = async (questionUrl: string): Promise<void> => {
  try {
    await CourseAPI.assessment.assessments.deleteQuestion(questionUrl);
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const convertMcqMrq = async (
  convertUrl: string,
): Promise<McqMrqListData> => {
  try {
    const response =
      await CourseAPI.assessment.assessments.convertMcqMrq(convertUrl);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const fetchQuestionRubrics = async (): Promise<RubricData[]> => {
  const response = await CourseAPI.assessment.question.rubrics.index();
  return response.data;
};

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

export const createNewRubric = async (
  formData: RubricHeaderFormData,
): Promise<RubricData> => {
  try {
    const response = await CourseAPI.assessment.question.rubrics.create({
      grading_prompt: formData.gradingPrompt,
      categories_attributes: formData.categories.map((category) => ({
        name: category.name,
        criterions_attributes: category.criterions.map((criterion) => ({
          grade: criterion.grade,
          explanation: criterion.explanation,
        })),
      })),
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};

export const deleteRubric = async (rubricId: number): Promise<void> => {
  try {
    const response =
      await CourseAPI.assessment.question.rubrics.delete(rubricId);
    return response.data;
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
