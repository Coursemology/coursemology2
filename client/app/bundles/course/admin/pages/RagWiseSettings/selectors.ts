import { createSelector } from '@reduxjs/toolkit';
import { AppState } from 'store';
import {
  Course,
  Folder,
  ForumImport,
  Material,
} from 'types/course/admin/ragWise';

import {
  coursesAdapter,
  foldersAdapter,
  forumImportsAdapter,
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

const courseSelector = coursesAdapter.getSelectors<AppState>(
  (state) => state.courseSettings.ragWiseSettings.courses,
);

const forumImportSelector = forumImportsAdapter.getSelectors<AppState>(
  (state) => state.courseSettings.ragWiseSettings.forumImports,
);

export const getAllMaterials = (state: AppState): Material[] => {
  return materialSelector.selectAll(state);
};

export const getAllFolders = (state: AppState): Folder[] => {
  return folderSelector.selectAll(state);
};

export const getAllCourses = (state: AppState): Course[] => {
  return courseSelector.selectAll(state);
};

export const getAllForums = (state: AppState): ForumImport[] => {
  return forumImportSelector.selectAll(state);
};

export const getMaterialByFolderId = (
  state: AppState,
  folderId: number,
): Material[] => {
  const materials = getAllMaterials(state);
  return materials.filter((material) => material.folderId === folderId);
};

export const getForumImportsByCourseId = (
  state: AppState,
  courseId: number | undefined,
): ForumImport[] => {
  const forums = getAllForums(state);
  if (!courseId) {
    return forums;
  }
  return forums.filter((forum) => forum.courseId === courseId);
};

export const getSubfolder = (state: AppState, folderId: number): Folder[] => {
  const folders = getAllFolders(state);
  return folders.filter((folder) => folder.parentId === folderId);
};

export const getRootFolder = (state: AppState): Folder => {
  const folders = getAllFolders(state);
  return folders.filter((folder) => folder.parentId === null)[0];
};

export const getFolderExpandedSettings = createSelector(
  selectRagWiseSettingsStore,
  (ragWiseSettingsStore) => ragWiseSettingsStore.isFolderExpanded,
);

export const getCourseExpandedSettings = createSelector(
  selectRagWiseSettingsStore,
  (ragWiseSettingsStore) => ragWiseSettingsStore.isCourseExpanded,
);
