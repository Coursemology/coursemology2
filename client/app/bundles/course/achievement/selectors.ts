/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { AchievementPermissions } from 'types/course/achievements';
import { SelectionKey } from 'types/store';
import {
  selectEntity,
  selectMiniEntities,
  selectMiniEntity,
} from 'utilities/store';

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
