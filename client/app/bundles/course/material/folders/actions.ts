import {
  FolderListData,
  FolderPermissions,
  MaterialListData,
} from 'types/course/material/folders';
import {
  SaveFolderAction,
  DeleteFolderListAction,
  DeleteMaterialListAction,
  SAVE_FOLDER,
  DELETE_FOLDER_LIST,
  DELETE_MATERIAL_LIST,
  SaveMaterialListAction,
  SAVE_MATERIAL_LIST,
} from './types';

export function saveFolder(
  id: number,
  parentId: number | null,
  name: string,
  description: string,
  canStudentUpload: boolean,
  startAt: string,
  endAt: string | null,
  subfolders: FolderListData[],
  materials: MaterialListData[],
  permissions: FolderPermissions,
): SaveFolderAction {
  return {
    type: SAVE_FOLDER,
    id,
    parentId,
    name,
    description,
    canStudentUpload,
    startAt,
    endAt,
    subfolders,
    materials,
    permissions,
  };
}

export function deleteFolderList(folderId: number): DeleteFolderListAction {
  return { type: DELETE_FOLDER_LIST, folderId };
}

export function deleteMaterialList(
  materialId: number,
): DeleteMaterialListAction {
  return { type: DELETE_MATERIAL_LIST, materialId };
}

export function saveMaterialList(
  materialList: MaterialListData,
): SaveMaterialListAction {
  return { type: SAVE_MATERIAL_LIST, materialList };
}
