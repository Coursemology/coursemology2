import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import {
  ForumsSettingsData,
  ForumsSettingsPostData,
} from 'types/course/admin/forums';

type Data = Promise<ForumsSettingsData>;
type ProbableData = Promise<ForumsSettingsData | undefined>;

export const fetchForumsSettings = async (): Data => {
  const response = await CourseAPI.admin.forums.index();
  return response.data;
};

export const updateForumsSettings = async (
  data: ForumsSettingsData,
): ProbableData => {
  const adaptedData: ForumsSettingsPostData = {
    settings_forums_component: {
      title: data.title,
      pagination: data.pagination,
    },
  };

  try {
    const response = await CourseAPI.admin.forums.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};
