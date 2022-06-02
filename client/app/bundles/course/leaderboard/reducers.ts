import { produce } from 'immer';
import { createEntityStore, saveListToStore } from 'utilities/store';
import {
  LeaderboardActionType,
  LeaderboardState,
  SAVE_GROUPLEADERBOARD_ACHIEVEMENT,
  SAVE_GROUPLEADERBOARD_POINTS,
  SAVE_LEADERBOARD_ACHIEVEMENT,
  SAVE_LEADERBOARD_POINTS,
} from './types';

const initialState: LeaderboardState = {
  leaderboardPoints: createEntityStore(),
  leaderboardAchievement: createEntityStore(),
  groupLeaderboardPoints: createEntityStore(),
  groupLeaderboardAchievement: createEntityStore(),
};

const reducer = produce(
  (draft: LeaderboardState, action: LeaderboardActionType) => {
    switch (action.type) {
      case SAVE_LEADERBOARD_POINTS: {
        const leaderboardPointsList = action.usersPoints;
        saveListToStore(draft.leaderboardPoints, leaderboardPointsList);
        break;
      }
      case SAVE_LEADERBOARD_ACHIEVEMENT: {
        const leaderboardAchievementList = action.usersCount;
        saveListToStore(
          draft.leaderboardAchievement,
          leaderboardAchievementList,
        );
        break;
      }
      case SAVE_GROUPLEADERBOARD_POINTS: {
        const groupLeaderboardPointsList = action.groupPoints;
        saveListToStore(
          draft.groupLeaderboardPoints,
          groupLeaderboardPointsList,
        );
        break;
      }
      case SAVE_GROUPLEADERBOARD_ACHIEVEMENT: {
        const groupLeaderboardAchievementList = action.groupCount;
        saveListToStore(
          draft.groupLeaderboardAchievement,
          groupLeaderboardAchievementList,
        );
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
