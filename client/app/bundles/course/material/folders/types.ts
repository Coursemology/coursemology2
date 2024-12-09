import {
  FolderListData,
  FolderMiniEntity,
  FolderPermissions,
  MaterialListData,
  MaterialMiniEntity,
  MaterialWorkflowState,
} from 'types/course/material/folders';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_FOLDER = 'course/materials/folders/SAVE_FOLDER';
export const DELETE_FOLDER_LIST = 'course/materials/folders/DELETE_FOLDER_LIST';
export const DELETE_MATERIAL_LIST =
  'course/materials/folders/DELETE_MATERIAL_LIST';
export const SAVE_MATERIAL_LIST = 'course/materials/folders/SAVE_MATERIAL_LIST';
export const UPDATE_MATERIAL_WORKFLOW_STATE_LIST =
  'course/materials/folders/UPDATE_MATERIAL_WORKFLOW_STATE_LIST';

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

export interface UpdateMaterialWorkflowStateAction {
  type: typeof UPDATE_MATERIAL_WORKFLOW_STATE_LIST;
  materialId: number;
  state: MaterialWorkflowState;
}

export type FoldersActionType =
  | SaveFolderAction
  | DeleteFolderListAction
  | DeleteMaterialListAction
  | SaveMaterialListAction
  | UpdateMaterialWorkflowStateAction;

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
  advanceStartAt: number;
  permissions: FolderPermissions;
}
