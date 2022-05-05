import {
  AchievementCourseUserData,
  AchievementData,
  AchievementListData,
  AchievementPermissions,
} from 'types/course/achievements';
import * as types from './types';

export function saveAchievementList(
  achievementList: AchievementListData[],
  achievementPermissions: AchievementPermissions,
): types.SaveAchievementListAction {
  return {
    type: types.SAVE_ACHIEVEMENT_LIST,
    achievementList,
    achievementPermissions,
  };
}

export function saveAchievement(
  achievement: AchievementData,
): types.SaveAchievementAction {
  return {
    type: types.SAVE_ACHIEVEMENT,
    achievement,
  };
}

export function deleteAchievement(
  achievementId: number,
): types.DeleteAchievementAction {
  return {
    type: types.DELETE_ACHIEVEMENT,
    id: achievementId,
  };
}

export function saveAchievementCourseUsers(
  achievementId: number,
  achievementCourseUsers: AchievementCourseUserData[],
): types.SaveAchievementCourseUserAction {
  return {
    type: types.SAVE_ACHIEVEMENT_COURSE_USERS,
    id: achievementId,
    achievementCourseUsers,
  };
}
