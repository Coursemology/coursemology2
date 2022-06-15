import {
  CourseUserEntity,
  CourseUserMiniEntity,
  CourseUserListData,
  CourseUserData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import {
  PersonalTimeData,
  PersonalTimeEntity,
} from 'types/course/personalTimes';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_USERS_LIST = 'course/users/SAVE_USERS_LIST';
export const SAVE_USER = 'course/users/SAVE_USER';
export const SAVE_MANAGE_USERS_LIST = 'course/users/SAVE_MANAGE_USERS_LIST';
export const DELETE_USER = 'course/users/DELETE_USER';
export const SAVE_PERSONAL_TIMES_LIST = 'course/users/SAVE_PERSONAL_TIMES_LIST';
export const UPDATE_PERSONAL_TIME = 'course/users/UPDATE_PERSONAL_TIME';
export const DELETE_PERSONAL_TIME = 'course/users/DELETE_PERSONAL_TIME';

// Action Types
export interface SaveUsersListAction {
  type: typeof SAVE_USERS_LIST;
  userList: CourseUserListData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
}

export interface SaveUserAction {
  type: typeof SAVE_USER;
  user: CourseUserData;
}

export interface SaveManageUsersListAction {
  type: typeof SAVE_MANAGE_USERS_LIST;
  userList: CourseUserData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
}
export interface DeleteUserAction {
  type: typeof DELETE_USER;
  userId: number;
}

export interface SavePersonalTimesListAction {
  type: typeof SAVE_PERSONAL_TIMES_LIST;
  personalTimes: PersonalTimeData[];
}
export interface UpdatePersonalTimeAction {
  type: typeof UPDATE_PERSONAL_TIME;
  personalTime: PersonalTimeData;
}
export interface DeletePersonalTimeAction {
  type: typeof DELETE_PERSONAL_TIME;
  personalTimeId: number;
}

export type UsersActionType =
  | SaveUsersListAction
  | SaveUserAction
  | SaveManageUsersListAction
  | DeleteUserAction
  | SavePersonalTimesListAction
  | UpdatePersonalTimeAction
  | DeletePersonalTimeAction;

// State Types
export interface UsersState {
  users: EntityStore<CourseUserMiniEntity, CourseUserEntity>;
  permissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
  personalTimes: EntityStore<PersonalTimeEntity, PersonalTimeEntity>;
}
