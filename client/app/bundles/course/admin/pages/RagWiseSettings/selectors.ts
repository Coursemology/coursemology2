import { createSelector } from '@reduxjs/toolkit';
import { AppState } from 'store';
import { Folder, Material } from 'types/course/admin/ragWise';

import {
  foldersAdapter,
  materialsAdapter,
  RagWiseSettingsState,
} from 'course/admin/reducers/ragWiseSettings';

const selectRagWiseSettingsStore = (state: AppState): RagWiseSettingsState =>
  state.courseSettings.ragWiseSettings;

const folderSelector = foldersAdapter.getSelectors<AppState>(
  (state) => state.courseSettings.ragWiseSettings.folders,
);

const materialSelector = materialsAdapter.getSelectors<AppState>(
  (state) => state.courseSettings.ragWiseSettings.materials,
);

export const getAllMaterials = (state: AppState): Material[] => {
  return materialSelector.selectAll(state);
};

export const getAllFolders = (state: AppState): Folder[] => {
  return folderSelector.selectAll(state);
};

export const getMaterialByFolderId = (
  state: AppState,
  folderId: number,
): Material[] => {
  const materials = getAllMaterials(state);
  return materials.filter((material) => material.folderId === folderId);
};

export const getSubfolder = (state: AppState, folderId: number): Folder[] => {
  const folders = getAllFolders(state);
  return folders.filter((folder) => folder.parentId === folderId);
};

export const getRootFolder = (state: AppState): Folder => {
  const folders = getAllFolders(state);
  return folders.filter((folder) => folder.parentId === null)[0];
};

export const getExpandedSettings = createSelector(
  selectRagWiseSettingsStore,
  (ragWiseSettingsStore) => ragWiseSettingsStore.isFolderExpanded,
);
