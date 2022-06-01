import { LeaderboardAchievement, LeaderboardPoints } from "types/course/leaderboard";
import { SaveLeaderboardAchievementAction, SaveLeaderboardPointsAction, SAVE_LEADERBOARD_ACHIEVEMENT, SAVE_LEADERBOARD_POINTS } from "./types";

export function saveLeaderboardPoints(
  usersPoints: LeaderboardPoints[],
): SaveLeaderboardPointsAction{
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
