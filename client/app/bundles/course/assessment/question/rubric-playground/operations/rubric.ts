import { AxiosError } from 'axios';
import { RubricData } from 'types/course/rubrics';

import CourseAPI from 'api/course';

import { RubricEditFormData } from '../types';

export const createNewRubric = async (
  formData: RubricEditFormData,
): Promise<RubricData> => {
  try {
    const response = await CourseAPI.assessment.question.rubrics.create({
      grading_prompt: formData.gradingPrompt,
      model_answer: formData.modelAnswer,
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

// Thrown when setting a structurally incompatible revision active would re-grade existing answers; the
// backend rolls back and returns 409. The caller confirms with the user and retries with confirmRubricAdvance.
export class RubricAdvanceConfirmationError extends Error {}

export const setActiveRubric = async (
  rubricId: number,
  confirmRubricAdvance = false,
): Promise<void> => {
  try {
    await CourseAPI.assessment.question.rubrics.setActive(
      rubricId,
      confirmRubricAdvance,
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 409)
        throw new RubricAdvanceConfirmationError();
      throw error.response?.data?.errors;
    }

    throw error;
  }
};
