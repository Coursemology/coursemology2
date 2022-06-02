import {
  GroupLeaderboardAchievement,
  GroupLeaderboardAchievementEntity,
  GroupLeaderboardPoints,
  GroupLeaderboardPointsEntity,
  LeaderboardAchievement,
  LeaderboardAchievementEntity,
  LeaderboardPoints,
  LeaderboardPointsEntity,
} from 'types/course/leaderboard';
import { EntityStore } from 'types/store';

// Action Names

export const SAVE_LEADERBOARD_POINTS =
  'course/leadearboard/SAVE_LEADERBOARD_POINTS';
export const SAVE_LEADERBOARD_ACHIEVEMENT =
  'course/leadearboard/SAVE_LEADERBOARD_ACHIEVEMENT';
export const SAVE_GROUPLEADERBOARD_POINTS =
  'course/leadearboard/SAVE_GROUPLEADERBOARD_POINTS';
export const SAVE_GROUPLEADERBOARD_ACHIEVEMENT =
  'course/leadearboard/SAVE_GROUPLEADERBOARD_ACHIEVEMENT';

// Action Types

export interface SaveLeaderboardPointsAction {
  type: typeof SAVE_LEADERBOARD_POINTS;
  usersPoints: LeaderboardPoints[];
}

export interface SaveLeaderboardAchievementAction {
  type: typeof SAVE_LEADERBOARD_ACHIEVEMENT;
  usersCount: LeaderboardAchievement[];
}

export interface SaveGroupLeaderboardPointsAction {
  type: typeof SAVE_GROUPLEADERBOARD_POINTS;
  groupPoints: GroupLeaderboardPoints[];
}

export interface SaveGroupLeaderboardAchievementAction {
  type: typeof SAVE_GROUPLEADERBOARD_ACHIEVEMENT;
  groupCount: GroupLeaderboardAchievement[];
}

export type LeaderboardActionType =
  | SaveLeaderboardPointsAction
  | SaveLeaderboardAchievementAction
  | SaveGroupLeaderboardPointsAction
  | SaveGroupLeaderboardAchievementAction;

// State Types

export interface LeaderboardState {
  leaderboardPoints: EntityStore<LeaderboardPointsEntity>;
  leaderboardAchievement: EntityStore<LeaderboardAchievementEntity>;
  groupLeaderboardPoints: EntityStore<GroupLeaderboardPointsEntity>;
  groupLeaderboardAchievement: EntityStore<GroupLeaderboardAchievementEntity>;
}
