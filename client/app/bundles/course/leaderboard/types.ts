import {
  GroupLeaderboardAchievement,
  GroupLeaderboardAchievementEntity,
  GroupLeaderboardPoints,
  GroupLeaderboardPointsEntity,
  LeaderboardAchievement,
  LeaderboardAchievementEntity,
  LeaderboardPoints,
  LeaderboardPointsEntity,
  LeaderboardSettings,
} from 'types/course/leaderboard';
import { EntityStore } from 'types/store';

// Action Names

export const SAVE_LEADERBOARD_POINTS =
  'course/leadearboard/SAVE_LEADERBOARD_POINTS';
export const SAVE_LEADERBOARD_ACHIEVEMENT =
  'course/leadearboard/SAVE_LEADERBOARD_ACHIEVEMENT';
export const SAVE_GROUP_LEADERBOARD_POINTS =
  'course/leadearboard/SAVE_GROUP_LEADERBOARD_POINTS';
export const SAVE_GROUP_LEADERBOARD_ACHIEVEMENT =
  'course/leadearboard/SAVE_GROUP_LEADERBOARD_ACHIEVEMENT';
export const SAVE_LEADERBOARD_SETTINGS =
'course/leadearboard/SAVE_LEADERBOARD_SETTINGS';

// Action Types

export interface SaveLeaderboardPointsAction {
  type: typeof SAVE_LEADERBOARD_POINTS;
  leaderboardByExpPoints: LeaderboardPoints[];
}

export interface SaveLeaderboardAchievementAction {
  type: typeof SAVE_LEADERBOARD_ACHIEVEMENT;
  leaderboardByAchievementCount: LeaderboardAchievement[];
}

export interface SaveGroupLeaderboardPointsAction {
  type: typeof SAVE_GROUP_LEADERBOARD_POINTS;
  groupleaderboardByExpPoints: GroupLeaderboardPoints[];
}

export interface SaveGroupLeaderboardAchievementAction {
  type: typeof SAVE_GROUP_LEADERBOARD_ACHIEVEMENT;
  groupleaderboardByAchievementCount: GroupLeaderboardAchievement[];
}

export interface SaveLeaderboardSettingsAction {
  type: typeof SAVE_LEADERBOARD_SETTINGS;
  leaderboardSettings: LeaderboardSettings;
}

export type LeaderboardActionType =
  | SaveLeaderboardPointsAction
  | SaveLeaderboardAchievementAction
  | SaveGroupLeaderboardPointsAction
  | SaveGroupLeaderboardAchievementAction
  | SaveLeaderboardSettingsAction;

// State Types

export interface LeaderboardState {
  leaderboardSettings: LeaderboardSettings;
  leaderboardPoints: EntityStore<LeaderboardPointsEntity>;
  leaderboardAchievement: EntityStore<LeaderboardAchievementEntity>;
  groupLeaderboardPoints: EntityStore<GroupLeaderboardPointsEntity>;
  groupLeaderboardAchievement: EntityStore<GroupLeaderboardAchievementEntity>;
}
