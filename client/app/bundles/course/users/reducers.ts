import { produce } from 'immer';
import {
  createEntityStore,
  saveEntityToStore,
  saveListToStore,
  removeFromStore,
} from 'utilities/store';
import {
  UsersState,
  UsersActionType,
  SAVE_USER,
  SAVE_USERS_LIST,
  SAVE_MANAGE_USERS_LIST,
  DELETE_USER,
  SAVE_PERSONAL_TIMES_LIST,
  UPDATE_PERSONAL_TIME,
  DELETE_PERSONAL_TIME,
  UPDATE_USER_OPTION,
  DELETE_USER_OPTION,
} from './types';

const initialState: UsersState = {
  users: createEntityStore(),
  userOptions: createEntityStore(),
  permissions: {
    canManageCourseUsers: false,
    canManageEnrolRequests: false,
    canManagePersonalTimes: false,
    canRegisterWithCode: false,
  },
  manageCourseUsersData: {
    requestsCount: 0,
    invitationsCount: 0,
    defaultTimelineAlgorithm: 'fixed',
  },
  personalTimes: createEntityStore(),
};

const reducer = produce((draft: UsersState, action: UsersActionType) => {
  switch (action.type) {
    case SAVE_USERS_LIST: {
      const userList = action.userList;
      const entityList = userList.map((data) => ({
        ...data,
      }));
      saveListToStore(draft.users, entityList);
      draft.permissions = action.manageCourseUsersPermissions;
      break;
    }
    case SAVE_USER: {
      const userData = action.user;
      const userEntity = { ...userData };
      saveEntityToStore(draft.users, userEntity);
      break;
    }
    case SAVE_MANAGE_USERS_LIST: {
      const usersList = action.userList;
      const entityList = usersList.map((data) => ({
        ...data,
      }));
      saveListToStore(draft.users, entityList);
      if (action.userOptions.length > 0) {
        const userOptionsEntityList = action.userOptions.map((data) => ({
          ...data,
        }));
        saveListToStore(draft.userOptions, userOptionsEntityList);
      }
      draft.permissions = action.manageCourseUsersPermissions;
      draft.manageCourseUsersData = action.manageCourseUsersData;
      break;
    }
    case DELETE_USER: {
      const userId = action.userId;
      if (draft.users.byId[userId]) {
        removeFromStore(draft.users, userId);
      }
      break;
    }
    case SAVE_PERSONAL_TIMES_LIST: {
      const personalTimesList = action.personalTimes;
      const entityList = personalTimesList.map((data) => ({ ...data }));
      saveListToStore(draft.personalTimes, entityList);
      break;
    }
    case UPDATE_PERSONAL_TIME: {
      const newPersonalTime = action.personalTime;
      const personalTimeEntity = { ...newPersonalTime };
      saveEntityToStore(draft.personalTimes, personalTimeEntity);
      break;
    }
    case DELETE_PERSONAL_TIME: {
      const itemIdToDelete = Object.keys(draft.personalTimes.byId).filter(
        (itemId) =>
          draft.personalTimes.byId[itemId].personalTimeId ===
          action.personalTimeId,
      )[0];
      const entityToDelete = draft.personalTimes.byId[itemIdToDelete];
      if (entityToDelete) {
        const newEntity = {
          ...entityToDelete,
          new: true,
          personalStartAt: null,
          personalBonusEndAt: null,
          personalEndAt: null,
          personalTimeId: null,
        };
        saveEntityToStore(draft.personalTimes, newEntity);
      }
      break;
    }
    case UPDATE_USER_OPTION: {
      const userOption = action.userOption;
      const userOptionEntity = { ...userOption };
      saveEntityToStore(draft.userOptions, userOptionEntity);
      break;
    }
    case DELETE_USER_OPTION: {
      const optionId = action.id;
      if (draft.userOptions.byId[optionId]) {
        removeFromStore(draft.userOptions, optionId);
      }
      break;
    }
    default: {
      break;
    }
  }
}, initialState);

export default reducer;
