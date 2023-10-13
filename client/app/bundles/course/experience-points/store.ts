import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ExperiencePointsFilterData,
  ExperiencePointsRecordListData,
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRecordSettings,
} from 'types/course/experiencePointsRecords';
import { EntityStore } from 'types/store';
import {
  createEntityStore,
  removeAllFromStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

export interface ExperiencePointsState {
  records: EntityStore<ExperiencePointsRecordMiniEntity>;
  setting: ExperiencePointsRecordSettings;
}

const initialState: ExperiencePointsState = {
  records: createEntityStore(),
  setting: { rowCount: 0, filters: { names: [] }, studentName: '' },
};

export const experiencePointsStore = createSlice({
  name: 'experiencePoints',
  initialState,
  reducers: {
    saveExperiencePointsRecordList: (
      state,
      action: PayloadAction<{
        rowCount: number;
        records: ExperiencePointsRecordListData[];
        filters?: ExperiencePointsFilterData;
        studentName?: string;
      }>,
    ) => {
      removeAllFromStore(state.records);
      saveListToStore(state.records, action.payload.records);

      state.setting.rowCount = action.payload.rowCount;
      state.setting.filters = action.payload.filters ?? { names: [] };
      state.setting.studentName = action.payload.studentName ?? '';
    },
    updateExperiencePointsRecord: (
      state,
      action: PayloadAction<{ data: ExperiencePointsRecordListData }>,
    ) => {
      const recordId = action.payload.data.id;
      if (state.records.byId[recordId]) {
        const prevEntity = state.records.byId[recordId]!;
        const nextEntity = {
          ...prevEntity,
          reason: {
            ...prevEntity.reason,
            text: action.payload.data.reason.text,
          },
          pointsAwarded: action.payload.data.pointsAwarded,
          updatedAt: action.payload.data.updatedAt,
          updated: action.payload.data.updater,
        };

        saveEntityToStore(state.records, nextEntity);
      }
    },
    deleteExperiencePointsRecord: (
      state,
      action: PayloadAction<{ id: number }>,
    ) => {
      const recordId = action.payload.id;
      if (state.records.byId[recordId]) {
        removeFromStore(state.records, recordId);
      }
    },
  },
});

export const actions = experiencePointsStore.actions;

export default experiencePointsStore.reducer;
