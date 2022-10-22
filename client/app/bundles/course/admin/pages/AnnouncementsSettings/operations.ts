import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import {
  AnnouncementsSettingsData,
  AnnouncementsSettingsPostData,
} from 'types/course/admin/announcements';

type Data = Promise<AnnouncementsSettingsData>;

export const fetchAnnouncementsSettings = async (): Data => {
  const response = await CourseAPI.admin.announcements.index();
  return response.data;
};

export const updateAnnouncementsSettings = async (
  data: AnnouncementsSettingsData,
): Data => {
  const adaptedData: AnnouncementsSettingsPostData = {
    settings_announcements_component: {
      title: data.title,
    },
  };

  try {
    const response = await CourseAPI.admin.announcements.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;
    throw error;
  }
};
