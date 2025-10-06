import { AxiosError } from 'axios';
import { QuestionOrderPostData } from 'types/course/assessment/assessments';
import { McqMrqListData } from 'types/course/assessment/question/multiple-responses';
import { QuestionDuplicationResult } from 'types/course/assessment/questions';
import { RubricAnswerData, RubricData } from 'types/course/rubrics';

import CourseAPI from 'api/course';

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

export const fetchQuestionRubrics = async (): Promise<{
  rubrics: RubricData[];
}> => {
  try {
    const response = await CourseAPI.assessment.question.rubrics.index();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
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
