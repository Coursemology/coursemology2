import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ItemWithTimeData,
  TimeData,
  TimelineData,
  TimelinesData,
} from 'types/course/referenceTimelines';

import { TimelinesState } from './types';

const initialState: TimelinesState = {
  timelines: [],
  items: [],
  gamified: false,
  defaultTimeline: 0,
};

export const timelinesSlice = createSlice({
  name: 'timelines',
  initialState,
  reducers: {
    updateAll: (_, action: PayloadAction<TimelinesData>) => action.payload,
    addEmptyTimeline: (state, action: PayloadAction<TimelineData>) => {
      const timeline = action.payload;
      state.timelines.push({
        ...timeline,
        timesCount: 0,
      });
    },
    removeTimeline: (state, action: PayloadAction<TimelineData['id']>) => {
      const id = action.payload;
      const timelineIndex = state.timelines.findIndex(
        (timeline) => timeline.id === id,
      );
      if (timelineIndex === -1) return;

      state.timelines.splice(timelineIndex, 1);
      state.items.forEach((item) => {
        delete item.times[id];
      });
    },
    updateTimeline: (
      state,
      action: PayloadAction<{
        id: TimelineData['id'];
        title?: TimelineData['title'];
        weight?: TimelineData['weight'];
      }>,
    ) => {
      const { id, title, weight } = action.payload;
      if (!title) return;

      const timelineToRename = state.timelines.find(
        (timeline) => timeline.id === id,
      );
      if (!timelineToRename) return;

      timelineToRename.title = title;
      timelineToRename.weight = weight;
    },
    addTimeToItem: (
      state,
      action: PayloadAction<{
        timelineId: TimelineData['id'];
        itemId: ItemWithTimeData['id'];
        time: TimeData;
      }>,
    ) => {
      const { timelineId, itemId, time } = action.payload;
      const times = state.items.find((item) => item.id === itemId)?.times;
      if (!times) return;

      times[timelineId] = time;

      const timelineToUpdate = state.timelines.find(
        (timeline) => timeline.id === timelineId,
      );
      if (!timelineToUpdate) return;

      timelineToUpdate.timesCount += 1;
    },
    removeTimeFromItem: (
      state,
      action: PayloadAction<{
        timelineId: TimelineData['id'];
        itemId: ItemWithTimeData['id'];
      }>,
    ) => {
      const { timelineId, itemId } = action.payload;
      const times = state.items.find((item) => item.id === itemId)?.times;
      if (!times) return;

      delete times[timelineId];

      const timelineToUpdate = state.timelines.find(
        (timeline) => timeline.id === timelineId,
      );
      if (!timelineToUpdate) return;

      timelineToUpdate.timesCount -= 1;
    },
    updateTimeInItem: (
      state,
      action: PayloadAction<{
        timelineId: TimelineData['id'];
        itemId: ItemWithTimeData['id'];
        time: {
          startAt?: TimeData['startAt'];
          bonusEndAt?: TimeData['bonusEndAt'] | null;
          endAt?: TimeData['endAt'] | null;
        };
      }>,
    ) => {
      const { timelineId, itemId, time } = action.payload;
      const times = state.items.find((item) => item.id === itemId)?.times;
      if (!times) return;

      const oldTime = times[timelineId];
      times[timelineId] = {
        id: oldTime.id,
        startAt: time.startAt ?? oldTime.startAt,
        bonusEndAt:
          time.bonusEndAt === null
            ? undefined
            : time.bonusEndAt ?? oldTime.bonusEndAt,
        endAt: time.endAt === null ? undefined : time.endAt ?? oldTime.endAt,
      };
    },
  },
});

export const actions = timelinesSlice.actions;

export default timelinesSlice.reducer;
