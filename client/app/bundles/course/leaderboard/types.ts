// import {
//   AchievementCourseUserData,
//   AchievementData,
//   AchievementEntity,
//   AchievementListData,
//   AchievementMiniEntity,
//   AchievementPermissions,
// } from 'types/course/achievements';
// import { EntityStore } from 'types/store';

import { LeaderboardAchievement, LeaderboardAchievementEntity, LeaderboardPoints, LeaderboardPointsEntity } from "types/course/leaderboard";
import { EntityStore } from "types/store";

// Action Names

export const SAVE_LEADERBOARD_POINTS = 'course/leadearboard/SAVE_LEADERBOARD_POINTS';
export const SAVE_LEADERBOARD_ACHIEVEMENT = 'course/leadearboard/SAVE_LEADERBOARD_ACHIEVEMENT';

// Action Types

export interface SaveLeaderboardPointsAction {
  type: typeof SAVE_LEADERBOARD_POINTS;
  usersPoints: LeaderboardPoints[];
}

export interface SaveLeaderboardAchievementAction {
  type: typeof SAVE_LEADERBOARD_ACHIEVEMENT;
  usersCount: LeaderboardAchievement[];
}

// export interface SaveAchievementAction {
//   type: typeof SAVE_ACHIEVEMENT;
//   achievement: AchievementData;
// }

// export interface DeleteAchievementAction {
//   type: typeof DELETE_ACHIEVEMENT;
//   id: number;
// }

// export interface SaveAchievementCourseUserAction {
//   type: typeof SAVE_ACHIEVEMENT_COURSE_USERS;
//   id: number;
//   achievementCourseUsers: AchievementCourseUserData[];
// }

export type LeaderboardActionType =
  | SaveLeaderboardPointsAction
  | SaveLeaderboardAchievementAction;

// State Types

export interface LeaderboardState {
  leaderboardPoints: EntityStore<LeaderboardPointsEntity>;
  leaderboardAchievement: EntityStore<LeaderboardAchievementEntity>;
}
