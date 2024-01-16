/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';

function getLocalState(state: AppState) {
  return state.assessments.statisticsPage;
}

export function getStatisticsPage(state: AppState) {
  return getLocalState(state);
}
