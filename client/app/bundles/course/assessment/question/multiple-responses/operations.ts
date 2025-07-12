import { AxiosError } from 'axios';
import {
  McqMrqData,
  McqMrqFormData,
  McqMrqPostData,
} from 'types/course/assessment/question/multiple-responses';
import { MrqGenerateResponse } from 'types/course/assessment/question-generation';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

export const fetchNewMrq = async (): Promise<McqMrqFormData<'new'>> => {
  const response = await CourseAPI.assessment.question.mcqMrq.fetchNewMrq();
  return response.data;
};

export const fetchNewMcq = async (): Promise<McqMrqFormData<'new'>> => {
  const response = await CourseAPI.assessment.question.mcqMrq.fetchNewMcq();
  return response.data;
};

export const fetchEditMrq = async (
  id: number,
): Promise<McqMrqFormData<'edit'>> => {
  const response = await CourseAPI.assessment.question.mcqMrq.fetchEdit(id);
  return response.data;
};

const adaptPostData = (data: McqMrqData): McqMrqPostData => ({
  question_multiple_response: {
    grading_scheme: data.gradingScheme,
    title: data.question.title,
    description: data.question.description,
    staff_only_comments: data.question.staffOnlyComments,
    maximum_grade: data.question.maximumGrade,
    randomize_options: data.question.randomizeOptions,
    skip_grading: data.question.skipGrading,
    question_assessment: { skill_ids: data.question.skillIds },
    options_attributes: data.options?.map((option, index) => ({
      id: option.draft ? undefined : option.id,
      correct: option.correct,
      option: option.option,
      explanation: option.explanation,
      ignore_randomization: option.ignoreRandomization,
      weight: index + 1,
      _destroy: option.toBeDeleted,
    })),
  },
});

export const updateMcqMrq = async (
  id: number,
  data: McqMrqData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response = await CourseAPI.assessment.question.mcqMrq.update(
      id,
      adaptedData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const create = async (data: McqMrqData): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response =
      await CourseAPI.assessment.question.mcqMrq.create(adaptedData);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const generate = async (
  data: FormData,
): Promise<MrqGenerateResponse> => {
  try {
    const response = await CourseAPI.assessment.question.mcqMrq.generate(data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
