import {
  GroupLeaderboardAchievement,
  GroupLeaderboardPoints,
  LeaderboardAchievement,
  LeaderboardPoints,
  LeaderboardSettings,
} from 'types/course/leaderboard';

import {
  SAVE_GROUP_LEADERBOARD_ACHIEVEMENT,
  SAVE_GROUP_LEADERBOARD_POINTS,
  SAVE_LEADERBOARD_ACHIEVEMENT,
  SAVE_LEADERBOARD_POINTS,
  SAVE_LEADERBOARD_SETTINGS,
  SaveGroupLeaderboardAchievementAction,
  SaveGroupLeaderboardPointsAction,
  SaveLeaderboardAchievementAction,
  SaveLeaderboardPointsAction,
  SaveLeaderboardSettingsAction,
} from './types';

export function saveLeaderboardPoints(
  leaderboardByExpPoints: LeaderboardPoints[],
): SaveLeaderboardPointsAction {
  return {
    type: SAVE_LEADERBOARD_POINTS,
    leaderboardByExpPoints,
  };
}

export function saveLeaderboardAchievement(
  leaderboardByAchievementCount: LeaderboardAchievement[],
): SaveLeaderboardAchievementAction {
  return {
    type: SAVE_LEADERBOARD_ACHIEVEMENT,
    leaderboardByAchievementCount,
  };
}

export function saveGroupLeaderboardPoints(
  groupleaderboardByExpPoints: GroupLeaderboardPoints[],
): SaveGroupLeaderboardPointsAction {
  return {
    type: SAVE_GROUP_LEADERBOARD_POINTS,
    groupleaderboardByExpPoints,
  };
}

export function saveGroupLeaderboardAchievement(
  groupleaderboardByAchievementCount: GroupLeaderboardAchievement[],
): SaveGroupLeaderboardAchievementAction {
  return {
    type: SAVE_GROUP_LEADERBOARD_ACHIEVEMENT,
    groupleaderboardByAchievementCount,
  };
}

export function saveLeaderboardSettings(
  leaderboardSettings: LeaderboardSettings,
): SaveLeaderboardSettingsAction {
  return {
    type: SAVE_LEADERBOARD_SETTINGS,
    leaderboardSettings,
  };
}
