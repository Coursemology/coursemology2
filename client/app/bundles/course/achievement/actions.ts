import {
  AchievementCourseUserData,
  AchievementData,
  AchievementListData,
  AchievementPermissions,
} from 'types/course/achievements';

import {
  DELETE_ACHIEVEMENT,
  DeleteAchievementAction,
  SAVE_ACHIEVEMENT,
  SAVE_ACHIEVEMENT_COURSE_USERS,
  SAVE_ACHIEVEMENT_LIST,
  SaveAchievementAction,
  SaveAchievementCourseUserAction,
  SaveAchievementListAction,
} from './types';

export function saveAchievementList(
  achievementList: AchievementListData[],
  achievementPermissions: AchievementPermissions,
): SaveAchievementListAction {
  return {
    type: SAVE_ACHIEVEMENT_LIST,
    achievementList,
    achievementPermissions,
  };
}

export function saveAchievement(
  achievement: AchievementData,
): SaveAchievementAction {
  return {
    type: SAVE_ACHIEVEMENT,
    achievement,
  };
}

export function deleteAchievement(
  achievementId: number,
): DeleteAchievementAction {
  return {
    type: DELETE_ACHIEVEMENT,
    id: achievementId,
  };
}

export function saveAchievementCourseUsers(
  achievementId: number,
  achievementCourseUsers: AchievementCourseUserData[],
): SaveAchievementCourseUserAction {
  return {
    type: SAVE_ACHIEVEMENT_COURSE_USERS,
    id: achievementId,
    achievementCourseUsers,
  };
}
