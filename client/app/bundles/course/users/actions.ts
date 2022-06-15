import {
  CourseUserData,
  CourseUserListData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { PersonalTimeData } from 'types/course/personalTimes';
import {
  SAVE_USER,
  SAVE_USERS_LIST,
  DELETE_USER,
  SaveUserAction,
  SaveUsersListAction,
  SaveManageUsersListAction,
  DeleteUserAction,
  SAVE_MANAGE_USERS_LIST,
  SavePersonalTimesListAction,
  SAVE_PERSONAL_TIMES_LIST,
  UpdatePersonalTimeAction,
  UPDATE_PERSONAL_TIME,
  DeletePersonalTimeAction,
  DELETE_PERSONAL_TIME,
} from './types';

export function saveUsersList(
  userList: CourseUserListData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
  manageCourseUsersData: ManageCourseUsersSharedData,
): SaveUsersListAction {
  return {
    type: SAVE_USERS_LIST,
    userList,
    manageCourseUsersPermissions,
    manageCourseUsersData,
  };
}

export function saveManageUsersList(
  userList: CourseUserData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
  manageCourseUsersData: ManageCourseUsersSharedData,
): SaveManageUsersListAction {
  return {
    type: SAVE_MANAGE_USERS_LIST,
    userList,
    manageCourseUsersPermissions,
    manageCourseUsersData,
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
  personalTimes: PersonalTimeData[],
): SavePersonalTimesListAction {
  return {
    type: SAVE_PERSONAL_TIMES_LIST,
    personalTimes,
  };
}

export function updatePersonalTime(
  personalTime: PersonalTimeData,
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
