import { createSelector } from '@reduxjs/toolkit';
import { TimelinesData } from 'types/course/referenceTimelines';

import { RootState } from './store';

const selectTimelinesStore = (state: RootState): TimelinesData =>
  state.timelines;

export const selectTimelines = createSelector(
  selectTimelinesStore,
  (timelinesStore) => timelinesStore.timelines,
);

export const selectItems = createSelector(
  selectTimelinesStore,
  (timelinesStore) => timelinesStore.items,
);
