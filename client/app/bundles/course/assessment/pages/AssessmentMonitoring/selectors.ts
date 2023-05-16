import { createSelector } from '@reduxjs/toolkit';
import { AppState } from 'store';
import { Snapshot } from 'types/channels/liveMonitoring';

import { MonitoringState } from './types';

const selectMonitoringStore = (state: AppState): MonitoringState =>
  state.assessments.monitoring;

type Selector<T> = (state: AppState) => T;
type UniversalSelectorFrom<S> = <K extends keyof S>(key: K) => Selector<S[K]>;

export const select: UniversalSelectorFrom<MonitoringState> = (key) =>
  createSelector(
    selectMonitoringStore,
    (monitoringStore) => monitoringStore[key],
  );

export const selectSnapshot = (id: number): Selector<Snapshot> =>
  createSelector(
    selectMonitoringStore,
    (monitoringStore) => monitoringStore.snapshots[id],
  );
