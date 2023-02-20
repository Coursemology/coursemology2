import { produce } from 'immer';
import {
  createEntityStore,
  removeFromStore,
  saveListToStore,
} from 'utilities/store';

import {
  DELETE_FOLDER_LIST,
  DELETE_MATERIAL_LIST,
  FoldersActionType,
  FoldersState,
  SAVE_FOLDER,
  SAVE_MATERIAL_LIST,
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
  breadcrumbs: [],
  advanceStartAt: 0,
  permissions: {
    isCurrentCourseStudent: false,
    canStudentUpload: false,
    canCreateSubfolder: false,
    canUpload: false,
    canEdit: false,
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
      draft.breadcrumbs = action.breadcrumbs;
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

export default reducer;
