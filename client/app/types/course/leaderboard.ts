/**
 * Data types for leaderboard data retrieved from backend through API call.
 */

import { Achievement } from './achievements';
import { CourseUserListData } from './courseUsers';

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

export interface LeaderboardAchievement extends CourseUserListData {
  achievementCount: number;
  achievements: Achievement[];
}
export interface LeaderboardPoints extends CourseUserListData {
  level: number;
  experience: number;
}

export interface GroupLeaderboardAchievement {
  id: number;
  name: string;
  averageAchievementCount: number;
  group: CourseUserListData[];
}

export interface GroupLeaderboardPoints {
  id: number;
  name: string;
  averageExperiencePoints: number;
  group: CourseUserListData[];
}

/**
 * Data types for leaderboard data used in frontend that are converted from
 * received backend data.
 */

export interface LeaderboardPointsEntity extends CourseUserListData {
  level: number;
  experience: number;
}

export interface LeaderboardAchievementEntity extends CourseUserListData {
  achievementCount: number;
  achievements: Achievement[];
}

export interface GroupLeaderboardAchievementEntity {
  id: number;
  name: string;
  averageAchievementCount: number;
  group: CourseUserListData[];
}

export interface GroupLeaderboardPointsEntity {
  id: number;
  name: string;
  averageExperiencePoints: number;
  group: CourseUserListData[];
}
