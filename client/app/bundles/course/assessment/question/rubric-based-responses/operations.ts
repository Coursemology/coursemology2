import { AxiosError } from 'axios';
import {
  RubricBasedResponseData,
  RubricBasedResponseFormData,
  RubricBasedResponsePostData,
} from 'types/course/assessment/question/rubric-based-responses';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

export const fetchNewRubricBasedResponse =
  async (): Promise<RubricBasedResponseFormData> => {
    const response =
      await CourseAPI.assessment.question.rubricBasedResponse.fetchNewRubricBasedResponse();
    return response.data;
  };

export const fetchEditRubricBasedResponse = async (
  id: number,
): Promise<RubricBasedResponseFormData> => {
  const response =
    await CourseAPI.assessment.question.rubricBasedResponse.fetchEditRubricBasedResponse(
      id,
    );
  return response.data;
};

const adaptPostData = (
  data: RubricBasedResponseData,
): RubricBasedResponsePostData => ({
  question_rubric_based_response: {
    title: data.question.title,
    description: data.question.description,
    staff_only_comments: data.question.staffOnlyComments,
    maximum_grade: data.question.maximumGrade,
    question_assessment: { skill_ids: data.question.skillIds },
    categories_attributes: data.categories?.map((category, _) => ({
      id: category.draft ? undefined : category.id,
      name: category.name,
      _destroy: category.grades.every((grade) => grade.toBeDeleted),
      criterions_attributes: category.grades.map((catGrade) => ({
        id: catGrade.draft ? undefined : catGrade.id,
        grade: catGrade.grade,
        explanation: catGrade.explanation,
        _destroy: catGrade.toBeDeleted,
      })),
    })),
    ai_grading_enabled: data.aiGradingEnabled,
    ai_grading_custom_prompt: data.aiGradingCustomPrompt,
  },
});

export const create = async (
  data: RubricBasedResponseData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response =
      await CourseAPI.assessment.question.rubricBasedResponse.create(
        adaptedData,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data.errors;
    throw error;
  }
};

export const update = async (
  id: number,
  data: RubricBasedResponseData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response =
      await CourseAPI.assessment.question.rubricBasedResponse.update(
        id,
        adaptedData,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data.errors;
    throw error;
  }
};
