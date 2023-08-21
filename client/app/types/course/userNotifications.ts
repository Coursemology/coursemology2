export type UserNotificationType = 'achievementGained' | 'levelReached';

export interface UserNotificationData {
  id: number;
  notificationType: UserNotificationType;
}

export interface AchievementGainedNotification extends UserNotificationData {
  badgeUrl: string | null;
  title: string;
  description: string;
}

export interface LevelReachedNotification extends UserNotificationData {
  levelNumber: number;
  leaderboardEnabled: boolean;
  leaderboardPosition: number | null;
}
