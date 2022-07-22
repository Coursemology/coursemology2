/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'types/store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.folders;
}

export function getFolderId(state: AppState) {
  return getLocalState(state).id;
}
export function getFolderParentId(state: AppState) {
  return getLocalState(state).parentId;
}
export function getFolderName(state: AppState) {
  return getLocalState(state).name;
}
export function getFolderDescription(state: AppState) {
  return getLocalState(state).description;
}
export function getFolderCanStudentUpload(state: AppState) {
  return getLocalState(state).canStudentUpload;
}
export function getFolderStartAt(state: AppState) {
  return getLocalState(state).startAt;
}
export function getFolderEndAt(state: AppState) {
  return getLocalState(state).endAt;
}

export function getFolderSubfolders(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).subfolders,
    getLocalState(state).subfolders.ids,
  );
}

export function getFolderMaterials(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).materials,
    getLocalState(state).materials.ids,
  );
}

export function getFolderPermissions(state: AppState) {
  return getLocalState(state).permissions;
}
