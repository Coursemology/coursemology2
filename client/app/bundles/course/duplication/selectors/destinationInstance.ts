import { createSelector } from '@reduxjs/toolkit';
import { AppState } from 'store';
import { DuplicationInstanceListData } from 'types/course/duplication';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selectDuplicationStore = (state: AppState): any => state.duplication;

export const selectDestinationInstances = createSelector(
  selectDuplicationStore,
  (duplicationStore) =>
    duplicationStore.destinationInstances as DuplicationInstanceListData[],
);

export const selectMetadata = createSelector(
  selectDuplicationStore,
  (duplicationStore) => duplicationStore.metadata,
);
