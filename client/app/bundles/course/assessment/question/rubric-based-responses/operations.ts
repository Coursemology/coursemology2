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
      maximum_score: category.maximumScore,
      _destroy: category.levels.every((level) => level.toBeDeleted),
      levels_attributes: category.levels.map((level) => ({
        id: level.draft ? undefined : level.id,
        level: level.level,
        explanation: level.explanation,
        _destroy: level.toBeDeleted,
      })),
    })),
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
