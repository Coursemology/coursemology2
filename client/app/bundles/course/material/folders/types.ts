import {
  FolderListData,
  FolderMiniEntity,
  FolderPermissions,
  MaterialListData,
  MaterialMiniEntity,
} from 'types/course/material/folders';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_FOLDER = 'course/materials/folders/SAVE_FOLDER';
export const DELETE_FOLDER_LIST = 'course/materials/folders/DELETE_FOLDER_LIST';
export const DELETE_MATERIAL_LIST =
  'course/materials/folders/DELETE_MATERIAL_LIST';
export const SAVE_MATERIAL_LIST = 'course/materials/folders/SAVE_MATERIAL_LIST';

// Action Types
export interface SaveFolderAction {
  type: typeof SAVE_FOLDER;
  currFolderInfo: {
    id: number;
    parentId: number | null;
    name: string;
    description: string;
    isConcrete: boolean;
    startAt: string;
    endAt: string | null;
  };

  subfolders: FolderListData[];
  materials: MaterialListData[];
  breadcrumbs: { id: number; name: string }[];
  advanceStartAt: number;
  permissions: FolderPermissions;
}

export interface DeleteFolderListAction {
  type: typeof DELETE_FOLDER_LIST;
  folderId: number;
}
export interface SaveMaterialListAction {
  type: typeof SAVE_MATERIAL_LIST;
  materialList: MaterialListData;
}
export interface DeleteMaterialListAction {
  type: typeof DELETE_MATERIAL_LIST;
  materialId: number;
}

export type FoldersActionType =
  | SaveFolderAction
  | DeleteFolderListAction
  | DeleteMaterialListAction
  | SaveMaterialListAction;

// State Types
export interface FoldersState {
  currFolderInfo: {
    id: number;
    parentId: number | null;
    name: string;
    description: string;
    isConcrete: boolean;
    startAt: string;
    endAt: string | null;
  };

  subfolders: EntityStore<FolderMiniEntity>;
  materials: EntityStore<MaterialMiniEntity>;
  breadcrumbs: { id: number; name: string }[];
  advanceStartAt: number;
  permissions: FolderPermissions;
}
