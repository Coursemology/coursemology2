import { AxiosError } from 'axios';
import { RubricData } from 'types/course/rubrics';

import CourseAPI from 'api/course';

import { RubricHeaderFormData } from '../types';

export const createNewRubric = async (
  formData: RubricHeaderFormData,
): Promise<RubricData> => {
  try {
    const response = await CourseAPI.assessment.question.rubrics.create({
      grading_prompt: formData.gradingPrompt,
      categories_attributes: formData.categories
        .filter((category) => !category.toBeDeleted)
        .map((category) => ({
          name: category.name,
          criterions_attributes: category.criterions
            .filter((criterion) => !criterion.toBeDeleted)
            .map((criterion) => ({
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

export const fetchQuestionRubrics = async (): Promise<RubricData[]> => {
  const response = await CourseAPI.assessment.question.rubrics.index();
  return response.data;
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
