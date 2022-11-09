import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { LessonPlanSettings } from 'types/course/admin/lessonPlan';

const initialState: LessonPlanSettings = {
  items_settings: [],
  component_settings: {},
};

export const lessonPlanSettingsSlice = createSlice({
  name: 'lessonPlanSettings',
  initialState,
  reducers: {
    update: (_state, action: PayloadAction<LessonPlanSettings>) =>
      action.payload,
  },
});

export const { update } = lessonPlanSettingsSlice.actions;

export default lessonPlanSettingsSlice.reducer;
