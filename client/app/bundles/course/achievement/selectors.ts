/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState, SelectionKey } from 'types/store';
import {
  selectMiniEntity,
  selectMiniEntities,
  selectEntity,
} from 'utilities/store';
import { AchievementPermissions } from 'types/course/achievements';

function getLocalState(state: AppState) {
  return state.achievements;
}

export function getAchievementMiniEntity(state: AppState, id: SelectionKey) {
  return selectMiniEntity(getLocalState(state).achievements, id);
}

export function getAchievementEntity(state: AppState, id: SelectionKey) {
  return selectEntity(getLocalState(state).achievements, id);
}

export function getAllAchievementMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).achievements,
    getLocalState(state).achievements.ids,
  );
}

export function getAchievementPermissions(state: AppState) {
  return getLocalState(state).permissions as AchievementPermissions;
}
