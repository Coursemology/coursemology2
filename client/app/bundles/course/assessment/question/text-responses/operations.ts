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

const adaptPostData = (data: TextResponseData): TextResponsePostData => {
  return {
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
      is_match_case: solution.isMatchCase,
      test_spreadsheet_attributes: (() => {
        if (!solution.spreadsheet) return undefined;
        if (solution.solutionType !== 'spreadsheet_formula') {
          return 'id' in solution.spreadsheet ? { id: solution.spreadsheet.id, _destroy: true } : undefined;
        }
        return {
          ...('id' in solution.spreadsheet && { id: solution.spreadsheet.id }),
          ...('raw' in solution.spreadsheet && { file: solution.spreadsheet.raw }),
          is_randomization_enabled: solution.spreadsheet.isRandomizationEnabled,
          variables: JSON.stringify(solution.spreadsheet.variables ?? {}),
        };
      })(),
    })),
  }};
};

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
