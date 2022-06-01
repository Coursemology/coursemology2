/**
 * Data types for leaderboard data retrieved from backend through API call.
 */

export interface LeaderboardData {
  usersPoints: LeaderboardPoints[];
  usersCount?: LeaderboardAchievement[];
}

export interface LeaderboardAchievement {
  id: number;
  name: string;
  userLink: string;
  userPicture: string;
  achievements: {
    badge: string;
    link: string;
  };
}
export interface LeaderboardPoints {
  id:number;
  name: string;
  userLink: string;
  userPicture: string;
  level: number;
  experience: number;
}

/**
 * Data types for leaderboard data used in frontend that are converted from
 * received backend data.
 */

export interface LeaderboardPointsEntity {
  id:number;
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
  achievements: {
    badge: string;
    link: string;
  };
}
