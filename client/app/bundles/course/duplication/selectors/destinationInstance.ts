import { createSelector } from '@reduxjs/toolkit';
import { AppState } from 'store';

import { DuplicationInstanceListData, DuplicationState } from '../types';

export const selectDuplicationStore = (state: AppState): DuplicationState =>
  state.duplication as DuplicationState;

export const selectDestinationInstances = createSelector(
  selectDuplicationStore,
  (duplicationStore) =>
    duplicationStore.destinationInstances as Record<
      number,
      DuplicationInstanceListData
    >,
);

export const selectMetadata = createSelector(
  selectDuplicationStore,
  (duplicationStore) => duplicationStore.metadata,
);
