import { produce } from 'immer';
import {
  createEntityStore,
  saveEntityToStore,
  saveListToStore,
  saveDetailedListToStore,
  removeFromStore,
} from 'utilities/store';
import {
  UsersState,
  UsersActionType,
  SAVE_USER,
  SAVE_USERS_LIST,
  SAVE_MANAGE_USERS_LIST,
  DELETE_USER,
} from './types';

const initialState: UsersState = {
  users: createEntityStore(),
  permissions: {
    canManageCourseUsers: false,
    canManageEnrolRequests: false,
    canManagePersonalTimes: false,
  },
  manageCourseUsersData: {
    requestsCount: 0,
    invitationsCount: 0,
  },
};

const reducer = produce((draft: UsersState, action: UsersActionType) => {
  switch (action.type) {
    case SAVE_USERS_LIST: {
      const userList = action.userList;
      const entityList = userList.map((data) => ({
        ...data,
      }));
      saveListToStore(draft.users, entityList);
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
      const entityList: CourseUserEntity[] = usersList.map((data) => ({
        ...data,
      }));
      saveDetailedListToStore(draft.users, entityList);
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
    default: {
      break;
    }
  }
}, initialState);

export default reducer;
