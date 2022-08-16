/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'types/store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.folders;
}

export function getCurrFolderInfo(state: AppState) {
  return getLocalState(state).currFolderInfo;
}

export function getFolderSubfolders(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).subfolders,
    getLocalState(state).subfolders.ids,
  ).sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
}

export function getFolderMaterials(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).materials,
    getLocalState(state).materials.ids,
  ).sort((a, b) => (a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1));
}

export function getBreadcrumbs(state: AppState) {
  return getLocalState(state).breadcrumbs;
}

export function getAdvanceStartAt(state: AppState) {
  return getLocalState(state).advanceStartAt;
}

export function getFolderPermissions(state: AppState) {
  return getLocalState(state).permissions;
}
