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

export const getLinkScholaisticCourseUrl = async (): Promise<string> => {
  const response =
    await CourseAPI.admin.scholaistic.getLinkScholaisticCourseUrl();
  return response.data.redirectUrl;
};

export const unlinkScholaisticCourse = async (): Promise<void> => {
  try {
    const response =
      await CourseAPI.admin.scholaistic.unlinkScholaisticCourse();
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
