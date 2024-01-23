/* eslint-disable @typescript-eslint/explicit-function-return-type */
// TODO: define store for statistics page (in next PR)
import { AppState } from 'store';

const getLocalState = (state: AppState) => state.assessments.statisticsPage;

export const getStatisticsPage = (state: AppState) => getLocalState(state);
