import { produce } from 'immer';
import { createEntityStore, saveListToStore } from 'utilities/store';

import {
  LeaderboardActionType,
  LeaderboardState,
  SAVE_GROUP_LEADERBOARD_ACHIEVEMENT,
  SAVE_GROUP_LEADERBOARD_POINTS,
  SAVE_LEADERBOARD_ACHIEVEMENT,
  SAVE_LEADERBOARD_POINTS,
  SAVE_LEADERBOARD_SETTINGS,
} from './types';

const initialState: LeaderboardState = {
  leaderboardSettings: {
    leaderboardTitle: '',
    groupleaderboardTitle: '',
  },
  leaderboardPoints: createEntityStore(),
  leaderboardAchievement: createEntityStore(),
  groupLeaderboardPoints: createEntityStore(),
  groupLeaderboardAchievement: createEntityStore(),
};

const reducer = produce(
  (draft: LeaderboardState, action: LeaderboardActionType) => {
    switch (action.type) {
      case SAVE_LEADERBOARD_POINTS: {
        const leaderboardPointsList = action.leaderboardByExpPoints;
        saveListToStore(draft.leaderboardPoints, leaderboardPointsList);
        break;
      }
      case SAVE_LEADERBOARD_ACHIEVEMENT: {
        const leaderboardAchievementList = action.leaderboardByAchievementCount;
        saveListToStore(
          draft.leaderboardAchievement,
          leaderboardAchievementList,
        );
        break;
      }
      case SAVE_GROUP_LEADERBOARD_POINTS: {
        const groupLeaderboardPointsList = action.groupleaderboardByExpPoints;
        saveListToStore(
          draft.groupLeaderboardPoints,
          groupLeaderboardPointsList,
        );
        break;
      }
      case SAVE_GROUP_LEADERBOARD_ACHIEVEMENT: {
        const groupLeaderboardAchievementList =
          action.groupleaderboardByAchievementCount;
        saveListToStore(
          draft.groupLeaderboardAchievement,
          groupLeaderboardAchievementList,
        );
        break;
      }
      case SAVE_LEADERBOARD_SETTINGS: {
        draft.leaderboardSettings = { ...action.leaderboardSettings };
        break;
      }
      default: {
        break;
      }
    }
  },
  initialState,
);

export default reducer;
