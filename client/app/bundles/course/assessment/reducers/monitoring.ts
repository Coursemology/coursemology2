import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  HeartbeatDetail,
  MonitoringMonitorData,
  Snapshot,
  Snapshots,
} from 'types/channels/liveMonitoring';

import { Activity, MonitoringState } from '../pages/AssessmentMonitoring/types';

const initialState: MonitoringState = {
  snapshots: {},
  history: [],
  status: 'connecting',
  monitor: {
    maxIntervalMs: 0,
    offsetMs: 0,
    validates: false,
    browserAuthorizationMethod: 'user_agent',
  },
};

export const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    initialize: (
      state,
      action: PayloadAction<{
        monitor: MonitoringMonitorData;
        snapshots: Snapshots;
      }>,
    ) => {
      state.monitor = action.payload.monitor;
      state.snapshots = action.payload.snapshots;
    },
    refresh: (
      state,
      action: PayloadAction<{ userId: number; data: Partial<Snapshot> }>,
    ) => {
      const { userId, data } = action.payload;
      const snapshot = state.snapshots[userId];

      state.snapshots[userId] = { ...snapshot, ...data };
    },
    pushHistory: (state, action: PayloadAction<Activity>) => {
      state.history.push(action.payload);
    },
    selectSnapshot: (state, action: PayloadAction<number>) => {
      const selectedUserId = action.payload;
      state.selectedUserId = selectedUserId;
      state.snapshots[selectedUserId].selected = true;
    },
    deselectSnapshot: (state) => {
      const userId = state.selectedUserId;
      if (!userId) return;

      state.selectedUserId = undefined;
      delete state.snapshots[userId].selected;
    },
    setStatus: (state, action: PayloadAction<MonitoringState['status']>) => {
      state.status = action.payload;
    },
    terminate: (state, action: PayloadAction<number>) => {
      const userId = action.payload;
      state.snapshots[userId].status = 'stopped';
    },
    supplySelectedSnapshot: (
      state,
      action: PayloadAction<HeartbeatDetail[]>,
    ) => {
      const { selectedUserId } = state;
      if (!selectedUserId) return;

      state.snapshots[selectedUserId].recentHeartbeats = action.payload;
    },
    filter: (state, action: PayloadAction<number[] | undefined>) => {
      const userIds = action.payload && new Set(action.payload);

      Object.entries(state.snapshots).forEach(([userId, snapshot]) => {
        if (!userIds) {
          snapshot.hidden = false;
        } else {
          snapshot.hidden = !userIds.has(parseInt(userId, 10));
        }
      });
    },
  },
});

export const monitoringActions = monitoringSlice.actions;

export default monitoringSlice.reducer;
