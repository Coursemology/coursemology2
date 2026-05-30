import { AxiosError } from 'axios';
import {
  SolutionEntity,
  TextResponseEditableFormData,
  TextResponseFormData,
  TextResponsePostData,
  TextResponseSolutionPostData,
  TextResponseSpreadsheetPostData,
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

// https://guides.rubyonrails.org/action_controller_overview.html#hash-and-array-parameters

const objectToFormData = (
  obj: unknown,
  formData: FormData = new FormData(),
  parentKey = '',
): FormData => {
  if (obj === null || obj === undefined) {
    formData.append(parentKey, '');
  } else if (obj instanceof File) {
    formData.append(parentKey, obj);
  } else if (typeof obj === 'boolean') {
    formData.append(parentKey, obj ? '1' : '0');
  } else if (typeof obj === 'number') {
    formData.append(parentKey, String(obj));
  } else if (typeof obj === 'string') {
    formData.append(parentKey, obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => {
      objectToFormData(item, formData, `${parentKey}[]`);
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

const adaptSpreadsheetPostData = (
  spreadsheet: SolutionEntity['spreadsheet'],
): TextResponseSpreadsheetPostData | null => {
  if (!spreadsheet) return null;

  return {
    ...(spreadsheet.id && { id: spreadsheet.id }),
    ...(spreadsheet.file?.file && { file: spreadsheet.file.file }),
    is_randomization_enabled: spreadsheet.isRandomizationEnabled,
    is_random_seed_fixed: spreadsheet.isRandomSeedFixed,
    test_random_seed: spreadsheet.randomSeed,
    is_timestamp_fixed: spreadsheet.isTimestampFixed,
    test_timestamp: spreadsheet.testTimestamp,
    num_random_tests: spreadsheet.numRandomTests,
    variables: JSON.stringify(spreadsheet.variables ?? []),
  };
};

const adaptSolutionPostData = (
  solution: SolutionEntity,
): TextResponseSolutionPostData => {
  const solutionData: TextResponseSolutionPostData = {
    solution: solution.solution,
    solution_type: solution.solutionType,
    grade: solution.grade,
    explanation: solution.explanation,
    test_spreadsheet_attributes: adaptSpreadsheetPostData(solution.spreadsheet),
  };
  if (!solution.draft) solutionData.id = solution.id;
  if (solution.toBeDeleted) solutionData._destroy = true;
  return solutionData;
};

const adaptPostData = (
  data: TextResponseEditableFormData,
): TextResponsePostData => {
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
      solutions_attributes: data.solutions
        ? data.solutions.map(adaptSolutionPostData)
        : null,
    },
  };
};

export const create = async (
  data: TextResponseEditableFormData,
): Promise<JustRedirect> => {
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
  data: TextResponseEditableFormData,
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
