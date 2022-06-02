/**
 * Data types for leaderboard data retrieved from backend through API call.
 */

export interface LeaderboardData {
  usersPoints: LeaderboardPoints[];
  usersCount?: LeaderboardAchievement[];
  groupPoints?: GroupLeaderboardPoints[];
  groupCount?: GroupLeaderboardAchievement[];
}

export interface LeaderboardAchievement {
  id: number;
  name: string;
  userLink: string;
  userPicture: string;
  achievementCount: number;
  achievements: Achievement[];
}
export interface LeaderboardPoints {
  id: number;
  name: string;
  userLink: string;
  userPicture: string;
  level: number;
  experience: number;
}

export interface GroupLeaderboardAchievement {
  id: number;
  name: string;
  averageAchievementCount: number;
  group: User[];
  link: string;
}

export interface GroupLeaderboardPoints {
  id: number;
  name: string;
  averageExperiencePoints: number;
  group: User[];
  link: string;
}

interface Achievement {
  id: number;
  badge: string;
  link: string;
  name: string;
}

interface User {
  id: number;
  name: string;
  userLink: string;
  userPicture: string;
}

/**
 * Data types for leaderboard data used in frontend that are converted from
 * received backend data.
 */

export interface LeaderboardPointsEntity {
  id: number;
  name: string;
  userLink: string;
  userPicture: string;
  level: number;
  experience: number;
}

export interface LeaderboardAchievementEntity {
  id: number;
  name: string;
  userLink: string;
  userPicture: string;
  achievementCount: number;
  achievements: Achievement[];
}

export interface GroupLeaderboardAchievementEntity {
  id: number;
  name: string;
  averageAchievementCount: number;
  group: User[];
  link: string;
}

export interface GroupLeaderboardPointsEntity {
  id: number;
  name: string;
  averageExperiencePoints: number;
  group: User[];
  link: string;
}
