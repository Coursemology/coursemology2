import { AxiosError } from 'axios';
import {
  TextResponseData,
  TextResponseFormData,
  TextResponsePostData,
} from 'types/course/assessment/question/text-responses';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

export const fetchNewTextResponse = async (): Promise<
  TextResponseFormData<'new'>
> => {
  const response =
    await CourseAPI.assessment.question.textResponse.fetchNewTextResponse();
  return response.data;
};

export const fetchNewFileUpload = async (): Promise<
  TextResponseFormData<'new'>
> => {
  const response =
    await CourseAPI.assessment.question.textResponse.fetchNewFileUpload();
  return response.data;
};

export const fetchEdit = async (
  id: number,
): Promise<TextResponseFormData<'edit'>> => {
  const response =
    await CourseAPI.assessment.question.textResponse.fetchEdit(id);
  return response.data;
};

const objectToFormData = (
  obj: unknown,
  formData: FormData = new FormData(),
  parentKey = '',
): FormData => {
  if (obj === null || obj === undefined) {
    return formData;
  } else if (obj instanceof File) {
    formData.append(parentKey, obj);
  } else if (typeof obj === 'boolean') {
    formData.append(parentKey, obj ? '1' : '0');
  } else if (typeof obj === 'number') {
    formData.append(parentKey, String(obj));
  } else if (typeof obj === 'string') {
    formData.append(parentKey, obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      objectToFormData(item, formData, `${parentKey}[${index}]`);
    });
  } else {
    Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
      objectToFormData(
        value,
        formData,
        parentKey ? `${parentKey}[${key}]` : key,
      );
    });
  }
  return formData;
};

const adaptPostData = (data: TextResponseData): TextResponsePostData => ({
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
      test_spreadsheets_attributes: solution.spreadsheets?.map((file) => {
        if ('raw' in file) {
          return {
            file: file.raw,
          };
        } else if (file.toBeDeleted) {
          return {
            id: file.id,
            _destroy: true,
          };
        } else {
          return null;
        }
      }).filter((v) => v !== null) as { file?: File; id?: number; _destroy?: boolean }[] ?? [],
    })),
  },
});

export const create = async (data: TextResponseData): Promise<JustRedirect> => {
  const formData = objectToFormData(adaptPostData(data));

  try {
    const response =
      await CourseAPI.assessment.question.textResponse.create(formData);

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

export const update = async (
  id: number,
  data: TextResponseData,
): Promise<JustRedirect> => {
  const formData = objectToFormData(adaptPostData(data));

  try {
    const response = await CourseAPI.assessment.question.textResponse.update(
      id,
      formData,
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
