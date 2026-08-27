import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  LessonPlanEventItem,
  LessonPlanGroup,
  LessonPlanItem,
  LessonPlanItemUpdate,
  LessonPlanMilestone,
  LessonPlanPayload,
} from '../types';

import {
  generateTypeKey,
  generateVisibilitySettings,
  groupItemsUnderMilestones,
  initializeVisibility,
} from './utils';

export interface LessonPlanState {
  items: LessonPlanItem[];
  milestones: LessonPlanMilestone[];
  groups: LessonPlanGroup[];
  visibilityByType: Record<string, boolean>;
  isLoading: boolean;
}

const initialState: LessonPlanState = {
  items: [],
  milestones: [],
  groups: [],
  visibilityByType: {},
  isLoading: false,
};

/**
 * Ids arrive as both numbers and strings depending on the payload, so they are
 * compared as strings, matching the `reducer-helpers` this slice replaced.
 */
const findById = <T extends { id?: number | string | null }>(
  array: T[],
  id?: number | string | null,
): number => array.findIndex((element) => String(element.id) === String(id));

/**
 * Merges `element` into the matching entry, or appends it. The merge matters:
 * an item update carries only the fields that changed, and the rest of the row
 * must survive.
 */
const updateOrAppend = <T extends { id?: number | string | null }>(
  array: T[],
  element: T,
): T[] => {
  const index = findById(array, element.id);
  if (index === -1) return [...array, element];

  const updated = [...array];
  updated[index] = { ...updated[index], ...element };
  return updated;
};

const deleteIfFound = <T extends { id?: number | string | null }>(
  array: T[],
  id?: number | string | null,
): T[] => {
  const index = findById(array, id);
  if (index === -1) return array;

  return array.filter((_, position) => position !== index);
};

export const lessonPlanSlice = createSlice({
  name: 'lessonPlan',
  initialState,
  reducers: {
    setItemTypeVisibility(
      state,
      action: PayloadAction<{ itemType: string; isVisible: boolean }>,
    ) {
      const { itemType, isVisible } = action.payload;
      state.visibilityByType[itemType] = isVisible;
    },

    loadRequested(state) {
      state.isLoading = true;
    },

    loadFailed(state) {
      state.isLoading = false;
    },

    loadSucceeded(state, action: PayloadAction<LessonPlanPayload>) {
      const items = action.payload.items.map(generateTypeKey);
      const visibilitySettings = generateVisibilitySettings(
        action.payload.visibilitySettings,
      );

      state.items = items;
      state.milestones = action.payload.milestones;
      state.groups = groupItemsUnderMilestones(
        items,
        action.payload.milestones,
      );
      state.visibilityByType = initializeVisibility(items, visibilitySettings);
      state.isLoading = false;
    },

    itemUpdated(
      state,
      action: PayloadAction<LessonPlanItemUpdate & { id: number }>,
    ) {
      const payload = action.payload as LessonPlanItem;
      const item = payload.lesson_plan_item_type
        ? generateTypeKey(payload)
        : payload;

      state.items = updateOrAppend(state.items, item);
      state.groups = groupItemsUnderMilestones(state.items, state.milestones);
    },

    milestoneCreated(state, action: PayloadAction<LessonPlanMilestone>) {
      state.milestones = [...state.milestones, action.payload];
      state.groups = groupItemsUnderMilestones(state.items, state.milestones);
    },

    milestoneUpdated(state, action: PayloadAction<LessonPlanMilestone>) {
      state.milestones = updateOrAppend(state.milestones, action.payload);
      state.groups = groupItemsUnderMilestones(state.items, state.milestones);
    },

    milestoneDeleted(state, action: PayloadAction<number>) {
      state.milestones = deleteIfFound(state.milestones, action.payload);
      state.groups = groupItemsUnderMilestones(state.items, state.milestones);
    },

    eventCreated(state, action: PayloadAction<LessonPlanEventItem>) {
      state.items = [
        ...state.items,
        generateTypeKey(action.payload as LessonPlanItem),
      ];
      state.groups = groupItemsUnderMilestones(state.items, state.milestones);
      state.visibilityByType = initializeVisibility(
        state.items,
        state.visibilityByType,
      );
    },

    eventUpdated(state, action: PayloadAction<LessonPlanEventItem>) {
      state.items = updateOrAppend(
        state.items,
        generateTypeKey(action.payload as LessonPlanItem),
      );
      state.groups = groupItemsUnderMilestones(state.items, state.milestones);
      state.visibilityByType = initializeVisibility(
        state.items,
        state.visibilityByType,
      );
    },

    eventDeleted(state, action: PayloadAction<number>) {
      state.items = deleteIfFound(state.items, action.payload);
      state.groups = groupItemsUnderMilestones(state.items, state.milestones);
      state.visibilityByType = initializeVisibility(
        state.items,
        state.visibilityByType,
      );
    },
  },
});

export const lessonPlanActions = lessonPlanSlice.actions;

export default lessonPlanSlice.reducer;
