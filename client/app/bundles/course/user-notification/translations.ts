import { defineMessages } from 'react-intl';

const translations = defineMessages({
  unlocked: {
    id: 'course.userNotification.AchievementGainedPopup.unlocked',
    defaultMessage: 'Achievement Unlocked!',
  },
  reached: {
    id: 'course.userNotification.LevelReachedPopup.reached',
    defaultMessage: 'Level {levelNumber} Reached!',
  },
  leaderboard: {
    id: 'course.userNotification.LevelReachedPopup.leaderboard',
    defaultMessage: 'Leaderboard',
  },
  leaderboardMessage: {
    id: 'course.userNotification.LevelReachedPopup.leaderboardMessage',
    defaultMessage:
      'You are currently at position {position} on the leaderboard. Good work!',
  },
});

export default translations;
