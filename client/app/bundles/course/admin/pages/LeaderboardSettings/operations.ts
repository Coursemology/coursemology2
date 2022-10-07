import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import {
  LeaderboardSettingsData,
  LeaderboardSettingsPostData,
} from 'types/course/admin/leaderboard';

type Data = Promise<LeaderboardSettingsData>;

export const fetchLeaderboardSettings = async (): Data => {
  const response = await CourseAPI.admin.leaderboard.index();
  return response.data;
};

export const updateLeaderboardSettings = async (
  data: LeaderboardSettingsData,
): Data => {
  const adaptedData: LeaderboardSettingsPostData = {
    settings_leaderboard_component: {
      title: data.title,
      display_user_count: data.displayUserCount,
      enable_group_leaderboard: data.enableGroupLeaderboard,
      group_leaderboard_title: data.groupLeaderboardTitle,
    },
  };

  try {
    const response = await CourseAPI.admin.leaderboard.update(adaptedData);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data.errors;
    throw error;
  }
};
