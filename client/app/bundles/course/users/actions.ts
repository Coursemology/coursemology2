import {
  CourseUserBasicListData,
  CourseUserData,
  CourseUserListData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { PersonalTimeListData } from 'types/course/personalTimes';
import {
  SAVE_USERS_LIST,
  SAVE_USER,
  SAVE_MANAGE_USERS_LIST,
  DELETE_USER,
  SAVE_PERSONAL_TIMES_LIST,
  UPDATE_PERSONAL_TIME,
  DELETE_PERSONAL_TIME,
  UPDATE_USER_OPTION,
  DELETE_USER_OPTION,
  SaveUserAction,
  SaveUsersListAction,
  SaveManageUsersListAction,
  DeleteUserAction,
  SavePersonalTimesListAction,
  UpdatePersonalTimeAction,
  DeletePersonalTimeAction,
  UpdateUserOptionAction,
  DeleteUserOptionAction,
} from './types';

export function saveUsersList(
  userList: CourseUserListData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
): SaveUsersListAction {
  return {
    type: SAVE_USERS_LIST,
    userList,
    manageCourseUsersPermissions,
  };
}

export function saveManageUsersList(
  userList: CourseUserListData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
  manageCourseUsersData: ManageCourseUsersSharedData,
  userOptions: CourseUserBasicListData[] = [],
): SaveManageUsersListAction {
  return {
    type: SAVE_MANAGE_USERS_LIST,
    userList,
    manageCourseUsersPermissions,
    manageCourseUsersData,
    userOptions,
  };
}

export function deleteUser(userId: number): DeleteUserAction {
  return {
    type: DELETE_USER,
    userId,
  };
}

export function saveUser(user: CourseUserData): SaveUserAction {
  return {
    type: SAVE_USER,
    user,
  };
}

export function savePersonalTimesList(
  personalTimes: PersonalTimeListData[],
): SavePersonalTimesListAction {
  return {
    type: SAVE_PERSONAL_TIMES_LIST,
    personalTimes,
  };
}

export function updatePersonalTime(
  personalTime: PersonalTimeListData,
): UpdatePersonalTimeAction {
  return {
    type: UPDATE_PERSONAL_TIME,
    personalTime,
  };
}

export function deletePersonalTime(
  personalTimeId: number,
): DeletePersonalTimeAction {
  return {
    type: DELETE_PERSONAL_TIME,
    personalTimeId,
  };
}

export function updateUserOption(
  userOption: CourseUserBasicListData,
): UpdateUserOptionAction {
  return {
    type: UPDATE_USER_OPTION,
    userOption,
  };
}

export function deleteUserOption(id: number): DeleteUserOptionAction {
  return {
    type: DELETE_USER_OPTION,
    id,
  };
}
