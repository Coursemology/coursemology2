import {
  GroupLeaderboardAchievement,
  GroupLeaderboardPoints,
  LeaderboardAchievement,
  LeaderboardPoints,
} from 'types/course/leaderboard';
import {
  SaveGroupLeaderboardAchievementAction,
  SaveGroupLeaderboardPointsAction,
  SaveLeaderboardAchievementAction,
  SaveLeaderboardPointsAction,
  SAVE_GROUPLEADERBOARD_ACHIEVEMENT,
  SAVE_GROUPLEADERBOARD_POINTS,
  SAVE_LEADERBOARD_ACHIEVEMENT,
  SAVE_LEADERBOARD_POINTS,
} from './types';

export function saveLeaderboardPoints(
  usersPoints: LeaderboardPoints[],
): SaveLeaderboardPointsAction {
  return {
    type: SAVE_LEADERBOARD_POINTS,
    usersPoints,
  };
}

export function saveLeaderboardAchievement(
  usersCount: LeaderboardAchievement[],
): SaveLeaderboardAchievementAction {
  return {
    type: SAVE_LEADERBOARD_ACHIEVEMENT,
    usersCount,
  };
}

export function saveGroupLeaderboardPoints(
  groupPoints: GroupLeaderboardPoints[],
): SaveGroupLeaderboardPointsAction {
  return {
    type: SAVE_GROUPLEADERBOARD_POINTS,
    groupPoints,
  };
}

export function saveGroupLeaderboardAchievement(
  groupCount: GroupLeaderboardAchievement[],
): SaveGroupLeaderboardAchievementAction {
  return {
    type: SAVE_GROUPLEADERBOARD_ACHIEVEMENT,
    groupCount,
  };
}
