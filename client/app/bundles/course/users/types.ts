import {
  CourseUserEntity,
  CourseUserMiniEntity,
  CourseUserListData,
  CourseUserData,
  CourseUsersPermissions,
} from 'types/course/courseUsers';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_USERS_LIST = 'course/users/SAVE_USERS_LIST';
export const SAVE_USER = 'course/users/SAVE_USER';
export const SAVE_USERS_LIST_WITH_PERMISSIONS =
  'course/users/SAVE_USERS_LIST_WITH_PERMISSIONS';
export const DELETE_USER = 'course/users/DELETE_USER';

// Action Types
export interface SaveUsersListAction {
  type: typeof SAVE_USERS_LIST;
  userList: CourseUserListData[];
}

export interface SaveUserAction {
  type: typeof SAVE_USER;
  user: CourseUserData;
}

export interface SaveUsersListWithPermissionsAction {
  type: typeof SAVE_USERS_LIST_WITH_PERMISSIONS;
  userList: CourseUserData[];
  courseUsersPermissions: CourseUsersPermissions;
}
export interface DeleteUserAction {
  type: typeof DELETE_USER;
  userId: number;
}

export type UsersActionType =
  | SaveUsersListAction
  | SaveUserAction
  | SaveUsersListWithPermissionsAction
  | DeleteUserAction;

// State Types
export interface UsersState {
  users: EntityStore<CourseUserMiniEntity, CourseUserEntity>;
  permissions: CourseUsersPermissions | null;
}
