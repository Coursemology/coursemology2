import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface LessonPlanItemSettings {
  component: string;
  enabled: boolean;
  visible: boolean;
  category_title?: string;
  tab_title?: string;
  options?: {
    category_id: number;
    tab_id: number;
  };
}

interface LessonPlanSettingsState {
  items_settings: LessonPlanItemSettings[];
  component_settings: {
    milestones_expanded?: 'all' | 'none' | 'current';
  };
}

const initialState: LessonPlanSettingsState = {
  items_settings: [],
  component_settings: {},
};

export const lessonPlanSettingsSlice = createSlice({
  name: 'lessonPlanSettings',
  initialState,
  reducers: {
    update: (_state, action: PayloadAction<LessonPlanSettingsState>) =>
      action.payload,
  },
});

export const { update } = lessonPlanSettingsSlice.actions;

export default lessonPlanSettingsSlice.reducer;
