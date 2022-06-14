import {
  CourseUserData,
  CourseUserListData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import {
  SAVE_USER,
  SAVE_USERS_LIST,
  DELETE_USER,
  SaveUserAction,
  SaveUsersListAction,
  SaveManageUsersListAction,
  DeleteUserAction,
  SAVE_MANAGE_USERS_LIST,
} from './types';

export function saveUsersList(
  userList: CourseUserListData[],
): SaveUsersListAction {
  return {
    type: SAVE_USERS_LIST,
    userList,
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
