import {
  createEntityAdapter,
  createSlice,
  EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  ExperiencePointsFilterData,
  ExperiencePointsRecordListData,
  ExperiencePointsRecordMiniEntity,
} from 'types/course/experiencePointsRecords';

interface ExperiencePointsRecordSettings {
  rowCount: number;
  filters: ExperiencePointsFilterData;
  studentName: string;
}

export interface ExperiencePointsState {
  records: EntityState<ExperiencePointsRecordMiniEntity, number>;
  settings: ExperiencePointsRecordSettings;
}

export const experiencePointsAdapter =
  createEntityAdapter<ExperiencePointsRecordMiniEntity>({});

const initialState: ExperiencePointsState = {
  records: experiencePointsAdapter.getInitialState(),
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
      experiencePointsAdapter.removeAll(state.records);
      experiencePointsAdapter.setAll(state.records, action.payload.records);

      state.settings.rowCount = action.payload.rowCount;
      state.settings.filters = action.payload.filters ?? { courseStudents: [] };
      state.settings.studentName = action.payload.studentName ?? '';
    },
    updateExperiencePointsRecord: (
      state,
      action: PayloadAction<{ data: ExperiencePointsRecordListData }>,
    ) => {
      const record = state.records.entities[action.payload.data.id];
      if (record) {
        record.reason.text = action.payload.data.reason.text;
        record.pointsAwarded = action.payload.data.pointsAwarded;
        record.updatedAt = action.payload.data.updatedAt;
        record.updater = action.payload.data.updater;

        experiencePointsAdapter.upsertOne(state.records, record);
      }
    },
    deleteExperiencePointsRecord: (
      state,
      action: PayloadAction<{ id: number }>,
    ) => {
      experiencePointsAdapter.removeOne(state.records, action.payload.id);
    },
  },
});

export const actions = experiencePointsStore.actions;

export default experiencePointsStore.reducer;
