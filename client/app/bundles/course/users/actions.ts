import {
  CourseUserData,
  CourseUserListData,
  CourseUsersPermissions,
} from 'types/course/courseUsers';
import {
  SAVE_USER,
  SAVE_USERS_LIST,
  SAVE_USERS_LIST_WITH_PERMISSIONS,
  DELETE_USER,
  SaveUserAction,
  SaveUsersListAction,
  SaveUsersListWithPermissionsAction,
  DeleteUserAction,
} from './types';

export function saveUsersList(
  userList: CourseUserListData[],
): SaveUsersListAction {
  return {
    type: SAVE_USERS_LIST,
    userList,
  };
}

export function saveUsersListWithPermissions(
  userList: CourseUserData[],
  courseUsersPermissions: CourseUsersPermissions,
): SaveUsersListWithPermissionsAction {
  return {
    type: SAVE_USERS_LIST_WITH_PERMISSIONS,
    userList,
    courseUsersPermissions,
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
