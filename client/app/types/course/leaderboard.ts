/**
 * Data types for leaderboard data retrieved from backend through API call.
 */

import { Achievement } from "./achievements";
import { CourseUserData } from "./course_users";

export interface LeaderboardSettings {
  leaderboardTitle?: string;
  groupleaderboardTitle?: string;
}
export interface LeaderboardData extends LeaderboardSettings {
  leaderboardByExpPoints: LeaderboardPoints[];
  leaderboardByAchievementCount?: LeaderboardAchievement[];
  groupleaderboardByExpPoints?: GroupLeaderboardPoints[];
  groupleaderboardByAchievementCount?: GroupLeaderboardAchievement[];
}

export interface LeaderboardAchievement extends CourseUserData {
  achievementCount: number;
  achievements: Achievement[];
}
export interface LeaderboardPoints extends CourseUserData {
  level: number;
  experience: number;
}

export interface GroupLeaderboardAchievement {
  id: number;
  name: string;
  averageAchievementCount: number;
  group: CourseUserData[];
}

export interface GroupLeaderboardPoints {
  id: number;
  name: string;
  averageExperiencePoints: number;
  group: CourseUserData[];
}

/**
 * Data types for leaderboard data used in frontend that are converted from
 * received backend data.
 */

export interface LeaderboardPointsEntity extends CourseUserData {
  level: number;
  experience: number;
}

export interface LeaderboardAchievementEntity extends CourseUserData {
  achievementCount: number;
  achievements: Achievement[];
}

export interface GroupLeaderboardAchievementEntity {
  id: number;
  name: string;
  averageAchievementCount: number;
  group: CourseUserData[];
}

export interface GroupLeaderboardPointsEntity {
  id: number;
  name: string;
  averageExperiencePoints: number;
  group: CourseUserData[];
}
