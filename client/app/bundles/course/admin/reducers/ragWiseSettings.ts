import type { EntityState, PayloadAction } from '@reduxjs/toolkit';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import {
  Course,
  Folder,
  ForumImport,
  Material,
} from 'types/course/admin/ragWise';

import { MATERIAL_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import { FORUM_IMPORT_WORKFLOW_STATE } from '../pages/RagWiseSettings/constants';

export const foldersAdapter = createEntityAdapter<Folder>({});
export const materialsAdapter = createEntityAdapter<Material>({});
export const coursesAdapter = createEntityAdapter<Course>({});
export const forumImportsAdapter = createEntityAdapter<ForumImport>({});

export interface RagWiseSettingsState {
  materials: EntityState<Material>;
  folders: EntityState<Folder>;
  courses: EntityState<Course>;
  forumImports: EntityState<ForumImport>;
  isFolderExpanded: boolean;
  isCourseExpanded: boolean;
}

const initialState: RagWiseSettingsState = {
  materials: materialsAdapter.getInitialState(),
  folders: foldersAdapter.getInitialState(),
  courses: coursesAdapter.getInitialState(),
  forumImports: forumImportsAdapter.getInitialState(),
  isFolderExpanded: false,
  isCourseExpanded: false,
};

export const ragWiseSettingsSlice = createSlice({
  name: 'ragWiseSettings',
  initialState,
  reducers: {
    saveAllFolders: (
      state,
      action: PayloadAction<{
        folders: Folder[];
      }>,
    ) => {
      foldersAdapter.setAll(state.folders, action.payload.folders);
    },
    saveAllMaterials: (
      state,
      action: PayloadAction<{
        materials: Material[];
      }>,
    ) => {
      materialsAdapter.setAll(state.materials, action.payload.materials);
    },
    saveAllCourses: (
      state,
      action: PayloadAction<{
        courses: Course[];
      }>,
    ) => {
      coursesAdapter.setAll(state.courses, action.payload.courses);
    },
    saveAllForums: (
      state,
      action: PayloadAction<{
        forums: ForumImport[];
      }>,
    ) => {
      forumImportsAdapter.setAll(state.forumImports, action.payload.forums);
    },
    updateMaterialsWorkflowState: (
      state,
      action: PayloadAction<{
        ids: number[];
        workflowState: keyof typeof MATERIAL_WORKFLOW_STATE;
      }>,
    ) => {
      materialsAdapter.updateMany(
        state.materials,
        action.payload.ids.map((id) => ({
          id,
          changes: { workflowState: action.payload.workflowState },
        })),
      );
    },
    updateForumImportsWorkflowState: (
      state,
      action: PayloadAction<{
        ids: number[];
        workflowState: keyof typeof FORUM_IMPORT_WORKFLOW_STATE;
      }>,
    ) => {
      forumImportsAdapter.updateMany(
        state.forumImports,
        action.payload.ids.map((id) => ({
          id,
          changes: { workflowState: action.payload.workflowState },
        })),
      );
    },
    updateIsFolderExpandedSettings: (
      state,
      action: PayloadAction<{
        isExpanded: boolean;
      }>,
    ) => {
      state.isFolderExpanded = action.payload.isExpanded;
    },
    updateIsCourseExpandedSettings: (
      state,
      action: PayloadAction<{
        isExpanded: boolean;
      }>,
    ) => {
      state.isCourseExpanded = action.payload.isExpanded;
    },
  },
});

export const {
  saveAllFolders,
  saveAllMaterials,
  saveAllCourses,
  saveAllForums,
  updateMaterialsWorkflowState,
  updateForumImportsWorkflowState,
  updateIsFolderExpandedSettings,
  updateIsCourseExpandedSettings,
} = ragWiseSettingsSlice.actions;

export default ragWiseSettingsSlice.reducer;
