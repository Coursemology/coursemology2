import {
  CourseUserEntity,
  CourseUserMiniEntity,
  CourseUserListData,
  CourseUserData,
  ManageCourseUsersPermissions,
  ManageCourseUsersTabData,
} from 'types/course/courseUsers';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_USERS_LIST = 'course/users/SAVE_USERS_LIST';
export const SAVE_USER = 'course/users/SAVE_USER';
export const SAVE_MANAGE_USERS_LIST = 'course/users/SAVE_MANAGE_USERS_LIST';
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

export interface SaveManageUsersListAction {
  type: typeof SAVE_MANAGE_USERS_LIST;
  userList: CourseUserData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersTabData;
}
export interface DeleteUserAction {
  type: typeof DELETE_USER;
  userId: number;
}

export type UsersActionType =
  | SaveUsersListAction
  | SaveUserAction
  | SaveManageUsersListAction
  | DeleteUserAction;

// State Types
export interface UsersState {
  users: EntityStore<CourseUserMiniEntity, CourseUserEntity>;
  permissions: ManageCourseUsersPermissions | null;
  manageCourseUsersData: ManageCourseUsersTabData | null;
}
