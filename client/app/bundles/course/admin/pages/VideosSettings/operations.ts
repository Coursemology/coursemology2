import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import {
  VideosSettingsData,
  VideosSettingsPostData,
  VideosTab,
  VideosTabPostData,
} from 'types/course/admin/videos';

type Data = Promise<VideosSettingsData>;
type ProbableData = Promise<VideosSettingsData | undefined>;

export const fetchVideosSettings = async (): Data => {
  const response = await CourseAPI.admin.videos.index();
  return response.data;
};

export const updateVideosSettings = async (
  data: VideosSettingsData,
): ProbableData => {
  const adaptedData: VideosSettingsPostData = {
    settings_videos_component: {
      title: data.title,
      course: {
        video_tabs_attributes: data.tabs,
      },
    },
  };

  try {
    const response = await CourseAPI.admin.videos.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};

export const deleteTab = async (id: VideosTab['id']): ProbableData => {
  try {
    const response = await CourseAPI.admin.videos.deleteTab(id);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};

export const createTab = async (
  title: VideosTab['title'],
  weight: VideosTab['weight'],
): ProbableData => {
  const adaptedData: VideosTabPostData = { tab: { title, weight } };

  try {
    const response = await CourseAPI.admin.videos.createTab(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(error.response?.data.errors);

    return undefined;
  }
};
