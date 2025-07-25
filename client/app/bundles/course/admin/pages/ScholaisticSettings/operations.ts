import { AxiosError } from 'axios';
import { ScholaisticSettingsData } from 'types/course/admin/scholaistic';

import CourseAPI from 'api/course';

export const fetchScholaisticSettings =
  async (): Promise<ScholaisticSettingsData> => {
    const response = await CourseAPI.admin.scholaistic.index();
    return response.data;
  };

export const updateScholaisticSettings = async (
  data: ScholaisticSettingsData,
): Promise<ScholaisticSettingsData> => {
  try {
    const response = await CourseAPI.admin.scholaistic.update({
      settings_scholaistic_component: {
        assessments_title: data.assessmentsTitle,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
