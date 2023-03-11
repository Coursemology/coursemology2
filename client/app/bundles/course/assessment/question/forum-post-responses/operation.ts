import { AxiosError } from 'axios';
import {
  ForumPostResponseData,
  ForumPostResponseFormData,
  ForumPostResponsePostData,
} from 'types/course/assessment/question/forum-post-responses';

import CourseAPI from 'api/course';
import { JustRedirect } from 'api/types';

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
    question_assessment: { skill_ids: data.question.skillIds },
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

export const updateForumPostResponse = async (
  id: number,
  data: ForumPostResponseData,
): Promise<JustRedirect> => {
  const adaptedData = adaptPostData(data);

  try {
    const response =
      await CourseAPI.assessment.question.forumPostResponse.updateForumPostResponse(
        id,
        adaptedData,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
