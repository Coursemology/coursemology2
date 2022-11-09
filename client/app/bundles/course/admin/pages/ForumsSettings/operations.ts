import { AxiosError } from 'axios';
import {
  ForumsSettingsData,
  ForumsSettingsPostData,
} from 'types/course/admin/forums';

import CourseAPI from 'api/course';

type Data = Promise<ForumsSettingsData>;

export const fetchForumsSettings = async (): Data => {
  const response = await CourseAPI.admin.forums.index();
  return response.data;
};

export const updateForumsSettings = async (data: ForumsSettingsData): Data => {
  const adaptedData: ForumsSettingsPostData = {
    settings_forums_component: {
      title: data.title,
      pagination: data.pagination,
      mark_post_as_answer_setting: data.markPostAsAnswerSetting,
    },
  };

  try {
    const response = await CourseAPI.admin.forums.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
