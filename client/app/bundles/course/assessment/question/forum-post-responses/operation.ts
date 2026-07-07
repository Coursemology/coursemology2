import { AxiosError } from 'axios';
import {
  ForumPostResponseData,
  ForumPostResponseFormData,
  ForumPostResponsePostData,
} from 'types/course/assessment/question/forum-post-responses';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

import { adaptGradingContextsPostData } from '../commons/gradingContexts';

export const fetchNewForumPostResponse = async (): Promise<
  ForumPostResponseFormData<'new'>
> => {
  const response =
    await CourseAPI.assessment.question.forumPostResponse.fetchNewForumPostResponse();
  return response.data;
};

export const fetchEditForumPostResponse = async (
  id: number,
): Promise<ForumPostResponseFormData<'edit'>> => {
  const response =
    await CourseAPI.assessment.question.forumPostResponse.fetchEditForumPostResponse(
      id,
    );
  return response.data;
};

// The rubric config (categories + AI prompt/model answer) is only meaningful, and only forwarded, under
// rubric grading mode.
const rubricAttributes = (
  data: ForumPostResponseData,
): Partial<ForumPostResponsePostData['question_forum_post_response']> => {
  if (data.gradingMode !== 'rubric') return {};

  return {
    categories_attributes: data.categories?.map((category) => ({
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
    ai_grading_custom_prompt: data.aiGradingCustomPrompt,
    ai_grading_model_answer: data.aiGradingModelAnswer,
    grading_contexts: adaptGradingContextsPostData(data.gradingContexts),
  };
};

const adaptPostData = (
  data: ForumPostResponseData,
): ForumPostResponsePostData => ({
  question_forum_post_response: {
    title: data.question.title,
    description: data.question.description,
    staff_only_comments: data.question.staffOnlyComments,
    maximum_grade: data.question.maximumGrade,
    has_text_response: data.question.hasTextResponse,
    max_posts: data.question.maxPosts,
    grading_mode: data.gradingMode,
    ai_grading_enabled: data.aiGradingEnabled,
    question_assessment: { skill_ids: data.question.skillIds },
    ...rubricAttributes(data),
  },
});

export const createForumPostResponse = async (
  data: ForumPostResponseData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response =
      await CourseAPI.assessment.question.forumPostResponse.createForumPostResponse(
        adaptedData,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};

// Thrown when an update is rejected because a rubric change is incompatible with existing grades and the
// caller has not confirmed re-grading. The edit page catches this to confirm, then retries with
// confirmRubricAdvance = true. (The backend rolls back, so nothing is saved until confirmed.)
export class RubricAdvanceConfirmationError extends Error {}

export const updateForumPostResponse = async (
  id: number,
  data: ForumPostResponseData,
  confirmRubricAdvance = false,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response =
      await CourseAPI.assessment.question.forumPostResponse.updateForumPostResponse(
        id,
        adaptedData,
        confirmRubricAdvance,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // 409 Conflict signals an incompatible rubric change awaiting confirmation.
      if (error.response?.status === 409)
        throw new RubricAdvanceConfirmationError();
      throw error.response?.data?.errors;
    }
    throw error;
  }
};
