/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.leaderboard;
}

export function getLeaderboardAchievements(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).leaderboardAchievement,
    getLocalState(state).leaderboardAchievement.ids,
  );
}

export function getLeaderboardPoints(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).leaderboardPoints,
    getLocalState(state).leaderboardPoints.ids,
  );
}

export function getGroupLeaderboardAchievements(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).groupLeaderboardAchievement,
    getLocalState(state).groupLeaderboardAchievement.ids,
  );
}

export function getGroupLeaderboardPoints(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).groupLeaderboardPoints,
    getLocalState(state).groupLeaderboardPoints.ids,
  );
}

export function getLeaderboardSettings(state: AppState) {
  return getLocalState(state).leaderboardSettings;
}
