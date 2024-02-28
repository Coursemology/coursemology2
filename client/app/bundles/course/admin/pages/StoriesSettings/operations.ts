import { AxiosError } from 'axios';
import {
  StoriesSettingsData,
  StoriesSettingsPostData,
} from 'types/course/admin/stories';

import CourseAPI from 'api/course';

export const fetchStoriesSettings = async (): Promise<StoriesSettingsData> => {
  const response = await CourseAPI.admin.stories.index();
  return response.data;
};

export const updateStoriesSettings = async (
  data: StoriesSettingsData,
): Promise<StoriesSettingsData> => {
  const adaptedData: StoriesSettingsPostData = {
    settings_stories_component: {
      push_key: data.pushKey,
    },
  };

  try {
    const response = await CourseAPI.admin.stories.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
