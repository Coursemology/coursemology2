import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ExperiencePointsFilterData,
  ExperiencePointsRecordListData,
  ExperiencePointsRecordMiniEntity,
} from 'types/course/experiencePointsRecords';
import { EntityStore } from 'types/store';
import {
  createEntityStore,
  removeAllFromStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

interface ExperiencePointsRecordSettings {
  rowCount: number;
  filters: ExperiencePointsFilterData;
  studentName: string;
}

export interface ExperiencePointsState {
  records: EntityStore<ExperiencePointsRecordMiniEntity>;
  settings: ExperiencePointsRecordSettings;
}

const initialState: ExperiencePointsState = {
  records: createEntityStore(),
  settings: { rowCount: 0, filters: { courseStudents: [] }, studentName: '' },
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

      state.settings.rowCount = action.payload.rowCount;
      state.settings.filters = action.payload.filters ?? { courseStudents: [] };
      state.settings.studentName = action.payload.studentName ?? '';
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
