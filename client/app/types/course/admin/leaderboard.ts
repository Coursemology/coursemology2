export interface LeaderboardSettingsData {
  title: string;
  displayUserCount: number;
  enableGroupLeaderboard: string;
  groupLeaderboardTitle: string;
}

export interface LeaderboardSettingsPostData {
  settings_leaderboard_component: {
    title: LeaderboardSettingsData['title'];
    display_user_count: LeaderboardSettingsData['displayUserCount'];
    enable_group_leaderboard: LeaderboardSettingsData['enableGroupLeaderboard'];
    group_leaderboard_title: LeaderboardSettingsData['groupLeaderboardTitle'];
  };
}
