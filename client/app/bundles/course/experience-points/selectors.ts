/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.experiencePoints;
}

export function getAllExpPointsRecordsEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).records,
    getLocalState(state).records.ids,
  );
}

export function getExpPointsRecordsSettings(state: AppState) {
  return getLocalState(state).setting;
}
