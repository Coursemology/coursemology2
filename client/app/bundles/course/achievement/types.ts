import {
  AchievementCourseUserData,
  AchievementData,
  AchievementEntity,
  AchievementListData,
  AchievementMiniEntity,
  AchievementPermissions,
} from 'types/course/achievements';
import { EntityStore } from 'types/store';

// Action Names

export const SAVE_ACHIEVEMENT_LIST = 'course/achievement/SAVE_ACHIEVEMENT_LIST';
export const SAVE_ACHIEVEMENT = 'course/achievement/SAVE_ACHIEVEMENT';
export const DELETE_ACHIEVEMENT = 'course/achievement/DELETE_ACHIEVEMENT';
export const SAVE_ACHIEVEMENT_COURSE_USERS =
  'course/achievement/SAVE_ACHIEVEMENT_COURSE_USERS';

// Action Types

export interface SaveAchievementListAction {
  type: typeof SAVE_ACHIEVEMENT_LIST;
  achievementList: AchievementListData[];
  achievementPermissions: AchievementPermissions;
}

export interface SaveAchievementAction {
  type: typeof SAVE_ACHIEVEMENT;
  achievement: AchievementData;
}

export interface DeleteAchievementAction {
  type: typeof DELETE_ACHIEVEMENT;
  id: number;
}

export interface SaveAchievementCourseUserAction {
  type: typeof SAVE_ACHIEVEMENT_COURSE_USERS;
  id: number;
  achievementCourseUsers: AchievementCourseUserData[];
}

export type AchievementsActionType =
  | SaveAchievementListAction
  | SaveAchievementAction
  | DeleteAchievementAction
  | SaveAchievementCourseUserAction;

// State Types

export interface AchievementsState {
  achievements: EntityStore<AchievementMiniEntity, AchievementEntity>;
  permissions: AchievementPermissions | null;
}
