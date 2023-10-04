import { produce } from 'immer';
import {
  CourseUserBasicListData,
  CourseUserData,
  CourseUserListData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { PersonalTimeListData } from 'types/course/personalTimes';
import { TimelineData } from 'types/course/referenceTimelines';
import {
  createEntityStore,
  removeFromStore,
  saveEntityToStore,
  saveListToStore,
} from 'utilities/store';

import {
  DELETE_PERSONAL_TIME,
  DELETE_USER,
  DELETE_USER_OPTION,
  DeletePersonalTimeAction,
  DeleteUserAction,
  DeleteUserOptionAction,
  SAVE_MANAGE_USER_LIST,
  SAVE_PERSONAL_TIME_LIST,
  SAVE_USER,
  SAVE_USER_LIST,
  SaveManageUserListAction,
  SavePersonalTimeListAction,
  SaveUserAction,
  SaveUserListAction,
  UPDATE_PERSONAL_TIME,
  UPDATE_USER_OPTION,
  UpdatePersonalTimeAction,
  UpdateUserOptionAction,
  UsersActionType,
  UsersState,
} from './types';

const initialState: UsersState = {
  users: createEntityStore(),
  userOptions: createEntityStore(),
  permissions: {
    canManageCourseUsers: false,
    canManageEnrolRequests: false,
    canManageReferenceTimelines: false,
    canManagePersonalTimes: false,
    canRegisterWithCode: false,
  },
  manageCourseUsersData: {
    requestsCount: 0,
    invitationsCount: 0,
    defaultTimelineAlgorithm: 'fixed',
  },
  personalTimes: createEntityStore(),
  timelines: {},
};

const reducer = produce((draft: UsersState, action: UsersActionType) => {
  switch (action.type) {
    case SAVE_USER_LIST: {
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
    case SAVE_MANAGE_USER_LIST: {
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
      draft.timelines = action.timelines;
      break;
    }
    case DELETE_USER: {
      const userId = action.userId;
      if (draft.users.byId[userId]) {
        removeFromStore(draft.users, userId);
      }
      break;
    }
    case SAVE_PERSONAL_TIME_LIST: {
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

export const actions = {
  saveUserList: (
    userList: CourseUserListData[],
    manageCourseUsersPermissions: ManageCourseUsersPermissions,
  ): SaveUserListAction => {
    return {
      type: SAVE_USER_LIST,
      userList,
      manageCourseUsersPermissions,
    };
  },

  saveManageUserList: (
    userList: CourseUserListData[],
    manageCourseUsersPermissions: ManageCourseUsersPermissions,
    manageCourseUsersData: ManageCourseUsersSharedData,
    userOptions: CourseUserBasicListData[] = [],
    timelines?: Record<TimelineData['id'], string>,
  ): SaveManageUserListAction => {
    return {
      type: SAVE_MANAGE_USER_LIST,
      userList,
      manageCourseUsersPermissions,
      manageCourseUsersData,
      userOptions,
      timelines,
    };
  },

  deleteUser: (userId: number): DeleteUserAction => {
    return {
      type: DELETE_USER,
      userId,
    };
  },

  saveUser: (user: CourseUserData): SaveUserAction => {
    return {
      type: SAVE_USER,
      user,
    };
  },

  savePersonalTimeList: (
    personalTimes: PersonalTimeListData[],
  ): SavePersonalTimeListAction => {
    return {
      type: SAVE_PERSONAL_TIME_LIST,
      personalTimes,
    };
  },

  updatePersonalTime: (
    personalTime: PersonalTimeListData,
  ): UpdatePersonalTimeAction => {
    return {
      type: UPDATE_PERSONAL_TIME,
      personalTime,
    };
  },

  deletePersonalTime: (personalTimeId: number): DeletePersonalTimeAction => {
    return {
      type: DELETE_PERSONAL_TIME,
      personalTimeId,
    };
  },

  updateUserOption: (
    userOption: CourseUserBasicListData,
  ): UpdateUserOptionAction => {
    return {
      type: UPDATE_USER_OPTION,
      userOption,
    };
  },

  deleteUserOption: (id: number): DeleteUserOptionAction => {
    return {
      type: DELETE_USER_OPTION,
      id,
    };
  },
};

export default reducer;
