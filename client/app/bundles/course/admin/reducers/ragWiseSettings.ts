import type { EntityState, PayloadAction } from '@reduxjs/toolkit';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Folder, Material } from 'types/course/admin/ragWise';

import { MATERIAL_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

export const foldersAdapter = createEntityAdapter<Folder>({});
export const materialsAdapter = createEntityAdapter<Material>({});

export interface RagWiseSettingsState {
  materials: EntityState<Material>;
  folders: EntityState<Folder>;
  isFolderExpanded: boolean;
}

const initialState: RagWiseSettingsState = {
  materials: materialsAdapter.getInitialState(),
  folders: foldersAdapter.getInitialState(),
  isFolderExpanded: false,
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
    updateMaterialWorkflowState: (
      state,
      action: PayloadAction<{
        id: number;
        workflowState: keyof typeof MATERIAL_WORKFLOW_STATE;
      }>,
    ) => {
      materialsAdapter.updateOne(state.materials, {
        id: action.payload.id,
        changes: {
          workflowState: action.payload.workflowState,
        },
      });
    },
    updateIsFolderExpandedSettings: (
      state,
      action: PayloadAction<{
        isExpanded: boolean;
      }>,
    ) => {
      state.isFolderExpanded = action.payload.isExpanded;
    },
  },
});

export const {
  saveAllFolders,
  saveAllMaterials,
  updateMaterialWorkflowState,
  updateIsFolderExpandedSettings,
} = ragWiseSettingsSlice.actions;

export default ragWiseSettingsSlice.reducer;
