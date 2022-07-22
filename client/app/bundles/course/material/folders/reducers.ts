import { produce } from 'immer';
import {
  createEntityStore,
  removeFromStore,
  saveListToStore,
} from 'utilities/store';
import {
  FoldersActionType,
  FoldersState,
  SAVE_FOLDER,
  DELETE_FOLDER_LIST,
  DELETE_MATERIAL_LIST,
  SAVE_MATERIAL_LIST,
} from './types';

const initialState: FoldersState = {
  id: 1,
  parentId: null,
  name: 'Workbin',
  description: '',
  canStudentUpload: false,
  startAt: '',
  endAt: null,
  subfolders: createEntityStore(),
  materials: createEntityStore(),
  permissions: {
    isCurrentCourseStudent: false,
    isConcrete: false,
    canCreateSubfolder: false,
    canUpload: false,
    canEdit: false,
  },
};

const reducer = produce((draft: FoldersState, action: FoldersActionType) => {
  switch (action.type) {
    case SAVE_FOLDER: {
      draft.id = action.id;
      draft.parentId = action.parentId;
      draft.name = action.name;
      draft.description = action.description;
      draft.canStudentUpload = action.canStudentUpload;
      draft.startAt = action.startAt;
      draft.endAt = action.endAt;

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

    case DELETE_MATERIAL_LIST: {
      const materialId = action.materialId;
      if (draft.materials.byId[materialId]) {
        removeFromStore(draft.materials, materialId);
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

    default: {
      break;
    }
  }
}, initialState);

export default reducer;
