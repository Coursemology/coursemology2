import { AxiosError } from 'axios';
import {
  TextResponseEditableFormData,
  TextResponseFormData,
  TextResponsePostData,
} from 'types/course/assessment/question/text-responses';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

export const fetchNewTextResponse = async (): Promise<
  Omit<TextResponseFormData, 'question'>
> => {
  const response =
    await CourseAPI.assessment.question.textResponse.fetchNewTextResponse();
  return response.data;
};

export const fetchNewFileUpload = async (): Promise<
  Omit<TextResponseFormData, 'question'>
> => {
  const response =
    await CourseAPI.assessment.question.textResponse.fetchNewFileUpload();
  return response.data;
};

export const fetchEdit = async (id: number): Promise<TextResponseFormData> => {
  const response =
    await CourseAPI.assessment.question.textResponse.fetchEdit(id);
  return response.data;
};

const adaptPostData = (
  data: TextResponseEditableFormData,
): TextResponsePostData => ({
  question_text_response: {
    title: data.question.title,
    description: data.question.description,
    staff_only_comments: data.question.staffOnlyComments,
    maximum_grade: data.question.maximumGrade,
    max_attachments: data.question.maxAttachments,
    max_attachment_size: data.question.maxAttachmentSize,
    is_attachment_required: data.question.isAttachmentRequired,
    template_text: data.question.templateText,
    hide_text: data.question.hideText,
    question_assessment: { skill_ids: data.question.skillIds },
    solutions_attributes: data.solutions?.map((solution, _) => ({
      id: solution.draft ? undefined : solution.id,
      solution: solution.solution,
      solution_type: solution.solutionType,
      grade: solution.grade,
      explanation: solution.explanation,
      _destroy: solution.toBeDeleted,
    })),
  },
});

export const create = async (
  data: TextResponseEditableFormData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response =
      await CourseAPI.assessment.question.textResponse.create(adaptedData);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const update = async (
  id: number,
  data: TextResponseEditableFormData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response = await CourseAPI.assessment.question.textResponse.update(
      id,
      adaptedData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
