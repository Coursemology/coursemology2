/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'types/store';
import {
  selectMiniEntities,
} from 'utilities/store';
// import { AchievementPermissions } from 'types/course/achievements';

function getLocalState(state: AppState) {
  return state.leaderboard;
}

export function getLeaderboardAchievements(state: AppState) {
  return selectMiniEntities(getLocalState(state).leaderboardAchievement, 
    getLocalState(state).leaderboardAchievement.ids);
}

export function getLeaderboardPoints(state: AppState) {
  return selectMiniEntities(getLocalState(state).leaderboardPoints, 
    getLocalState(state).leaderboardPoints.ids);
}

// export function getAchievementEntity(state: AppState, id: SelectionKey) {
//   return selectEntity(getLocalState(state).achievements, id);
// }

// export function getAllAchievementMiniEntities(state: AppState) {
//   return selectMiniEntities(
//     getLocalState(state).achievements,
//     getLocalState(state).achievements.ids,
//   );
// }

// export function getAchievementPermissions(state: AppState) {
//   return getLocalState(state).permissions as AchievementPermissions;
// }
