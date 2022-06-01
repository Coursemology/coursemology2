import { produce } from 'immer';
import { createEntityStore, saveListToStore } from 'utilities/store';
import { LeaderboardActionType, LeaderboardState, SAVE_LEADERBOARD_ACHIEVEMENT, SAVE_LEADERBOARD_POINTS } from './types';
// import {
//   AchievementCourseUserEntity,
//   AchievementEntity,
//   AchievementMiniEntity,
// } from 'types/course/achievements';
// import {
//   createEntityStore,
//   removeFromStore,
//   saveEntityToStore,
//   saveListToStore,
// } from 'utilities/store';


const initialState: LeaderboardState = {
  leaderboardPoints: createEntityStore(),
  leaderboardAchievement: createEntityStore(),
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
        saveListToStore(draft.leaderboardAchievement, leaderboardAchievementList);
        break;
      }
      default: {
        break;
      }
    }
  },
  initialState,
);;

export default reducer;
