import { produce } from 'immer';
import {
  FolderListData,
  FolderPermissions,
  MaterialListData,
  MaterialWorkflowState,
} from 'types/course/material/folders';
import {
  createEntityStore,
  removeFromStore,
  saveListToStore,
} from 'utilities/store';

import {
  DELETE_FOLDER_LIST,
  DELETE_MATERIAL_LIST,
  DeleteFolderListAction,
  DeleteMaterialListAction,
  FoldersActionType,
  FoldersState,
  SAVE_FOLDER,
  SAVE_MATERIAL_LIST,
  SaveFolderAction,
  SaveMaterialListAction,
  UPDATE_MATERIAL_WORKFLOW_STATE_LIST,
  UpdateMaterialWorkflowStateAction,
} from './types';

const initialState: FoldersState = {
  currFolderInfo: {
    id: 1,
    parentId: null,
    name: 'Workbin',
    description: '',
    isConcrete: false,
    startAt: '',
    endAt: null,
  },
  subfolders: createEntityStore(),
  materials: createEntityStore(),
  advanceStartAt: 0,
  permissions: {
    isCurrentCourseStudent: false,
    canStudentUpload: false,
    canCreateSubfolder: false,
    canUpload: false,
    canEdit: false,
    canManageKnowledgeBase: false,
  },
};

const reducer = produce((draft: FoldersState, action: FoldersActionType) => {
  switch (action.type) {
    case SAVE_FOLDER: {
      draft.currFolderInfo = action.currFolderInfo;

      const subfoldersList = action.subfolders;
      const subfoldersEntityList = subfoldersList.map((data) => ({
        ...data,
      }));
      draft.subfolders = createEntityStore();
      saveListToStore(draft.subfolders, subfoldersEntityList);

      const materialsList = action.materials;
      const materialsEntityList = materialsList.map((data) => ({
        ...data,
      }));
      draft.materials = createEntityStore();
      saveListToStore(draft.materials, materialsEntityList);

      draft.advanceStartAt = action.advanceStartAt;
      draft.permissions = action.permissions;
      break;
    }

    case DELETE_FOLDER_LIST: {
      const folderId = action.folderId;
      if (draft.subfolders.byId[folderId]) {
        removeFromStore(draft.subfolders, folderId);
      }
      break;
    }

    case SAVE_MATERIAL_LIST: {
      const materialId = action.materialList.id;
      if (draft.materials.byId[materialId]) {
        saveListToStore(draft.materials, [action.materialList]);
      }
      break;
    }

    case UPDATE_MATERIAL_WORKFLOW_STATE_LIST: {
      const materialId = action.materialId;
      const material = draft.materials.byId[materialId];
      if (material) {
        material.workflowState = action.state;
        saveListToStore(draft.materials, [material]);
      }
      break;
    }

    case DELETE_MATERIAL_LIST: {
      const materialId = action.materialId;
      if (draft.materials.byId[materialId]) {
        removeFromStore(draft.materials, materialId);
      }
      break;
    }

    default: {
      break;
    }
  }
}, initialState);

export const actions = {
  saveFolder: (
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
    advanceStartAt: number,
    permissions: FolderPermissions,
  ): SaveFolderAction => {
    return {
      type: SAVE_FOLDER,
      currFolderInfo,
      subfolders,
      materials,
      advanceStartAt,
      permissions,
    };
  },
  deleteFolderList: (folderId: number): DeleteFolderListAction => {
    return { type: DELETE_FOLDER_LIST, folderId };
  },
  deleteMaterialList: (materialId: number): DeleteMaterialListAction => {
    return { type: DELETE_MATERIAL_LIST, materialId };
  },
  saveMaterialList: (
    materialList: MaterialListData,
  ): SaveMaterialListAction => {
    return { type: SAVE_MATERIAL_LIST, materialList };
  },
  updateMaterialWorkflowStateList: (
    materialId: number,
    state: MaterialWorkflowState,
  ): UpdateMaterialWorkflowStateAction => {
    return { type: UPDATE_MATERIAL_WORKFLOW_STATE_LIST, materialId, state };
  },
};

export default reducer;
