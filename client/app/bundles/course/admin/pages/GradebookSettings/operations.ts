import { AxiosError } from 'axios';
import {
  GradebookSettingsData,
  GradebookSettingsPostData,
} from 'types/course/admin/gradebook';

import CourseAPI from 'api/course';

type Data = Promise<GradebookSettingsData>;

export const fetchGradebookSettings = async (): Data => {
  const response = await CourseAPI.admin.gradebook.index();
  return response.data;
};

export const updateGradebookSettings = async (
  data: GradebookSettingsData,
): Data => {
  const adaptedData: GradebookSettingsPostData = {
    settings_gradebook_component: {
      weighted_view_enabled: data.weightedViewEnabled,
    },
  };

  try {
    const response = await CourseAPI.admin.gradebook.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
