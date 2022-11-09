import {
  FolderListData,
  FolderPermissions,
  MaterialListData,
} from 'types/course/material/folders';

import {
  DELETE_FOLDER_LIST,
  DELETE_MATERIAL_LIST,
  DeleteFolderListAction,
  DeleteMaterialListAction,
  SAVE_FOLDER,
  SAVE_MATERIAL_LIST,
  SaveFolderAction,
  SaveMaterialListAction,
} from './types';

export function saveFolder(
  currFolderInfo: {
    id: number;
    parentId: number | null;
    name: string;
    description: string;
    isConcrete: boolean;
    startAt: string;
    endAt: string | null;
  },
  subfolders: FolderListData[],
  materials: MaterialListData[],
  breadcrumbs: { id: number; name: string }[],
  advanceStartAt: number,
  permissions: FolderPermissions,
): SaveFolderAction {
  return {
    type: SAVE_FOLDER,
    currFolderInfo,
    subfolders,
    materials,
    breadcrumbs,
    advanceStartAt,
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
