import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { LessonPlanEditColumn } from '../types';

import { lessonPlanActions } from './lessonPlan';

export interface LessonPlanFlagsState {
  canManageLessonPlan: boolean;
  milestonesExpanded: string;
  editPageColumnsVisible: Record<LessonPlanEditColumn, boolean>;
}

export const initialState: LessonPlanFlagsState = {
  canManageLessonPlan: false,
  milestonesExpanded: 'current',
  editPageColumnsVisible: {
    ITEM_TYPE: true,
    START_AT: true,
    BONUS_END_AT: false,
    END_AT: true,
    PUBLISHED: true,
  },
};

export const flagsSlice = createSlice({
  name: 'lessonPlanFlags',
  initialState,
  reducers: {
    setColumnVisibility(
      state,
      action: PayloadAction<{ field: string; isVisible: boolean }>,
    ) {
      const { field, isVisible } = action.payload;
      state.editPageColumnsVisible[field] = isVisible;
    },
  },
  // The flags arrive with the lesson plan itself, so this slice listens to the
  // load rather than owning a fetch of its own.
  extraReducers: (builder) => {
    builder.addCase(lessonPlanActions.loadSucceeded, (state, action) => {
      const { flags } = action.payload;
      state.canManageLessonPlan = flags.canManageLessonPlan;
      state.milestonesExpanded =
        flags.milestonesExpanded || initialState.milestonesExpanded;
    });
  },
});

export const flagsActions = flagsSlice.actions;

export default flagsSlice.reducer;
