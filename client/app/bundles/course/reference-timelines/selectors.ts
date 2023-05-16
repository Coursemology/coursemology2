import { createSelector } from '@reduxjs/toolkit';
import { AppState } from 'store';

import { TimelinesState } from './types';

const selectTimelinesStore = (state: AppState): TimelinesState =>
  state.timelines;

export const selectTimelines = createSelector(
  selectTimelinesStore,
  (timelinesStore) => timelinesStore.timelines,
);

export const selectItems = createSelector(
  selectTimelinesStore,
  (timelinesStore) => timelinesStore.items,
);
