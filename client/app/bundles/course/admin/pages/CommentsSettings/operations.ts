import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import {
  CommentsSettingsData,
  CommentsSettingsPostData,
} from 'types/course/admin/comments';

type Data = Promise<CommentsSettingsData>;

export const fetchCommentsSettings = async (): Data => {
  const response = await CourseAPI.admin.comments.index();
  return response.data;
};

export const updateCommentsSettings = async (
  data: CommentsSettingsData,
): Data => {
  const adaptedData: CommentsSettingsPostData = {
    settings_topics_component: {
      title: data.title,
      pagination: data.pagination,
    },
  };

  try {
    const response = await CourseAPI.admin.comments.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
