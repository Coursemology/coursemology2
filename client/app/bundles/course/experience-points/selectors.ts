/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';

import { experiencePointsAdapter } from './store';

const experiencePointsRecordsSelector =
  experiencePointsAdapter.getSelectors<AppState>(
    (state) => state.experiencePoints.records,
  );

function getLocalState(state: AppState) {
  return state.experiencePoints;
}

export function getAllExpPointsRecordsEntities(state: AppState) {
  return experiencePointsRecordsSelector.selectAll(state);
}

export function getExpPointsRecordsSettings(state: AppState) {
  return getLocalState(state).settings;
}
