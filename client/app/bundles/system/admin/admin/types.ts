import { EntityStore } from 'types/store';
import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementMiniEntity,
} from 'types/system/announcements';
import {
  CourseListData,
  CourseMiniEntity,
  CourseStats,
} from 'types/system/courses';
import {
  InstanceListData,
  InstanceMiniEntity,
  InstancePermissions,
} from 'types/system/instances';
import { UserListData, UserMiniEntity, AdminStats } from 'types/users';

// Action Names
export const SAVE_ANNOUNCEMENTS_LIST = 'system/admin/SAVE_ANNOUNCEMENTS_LIST';
export const SAVE_ANNOUNCEMENT = 'system/admin/SAVE_ANNOUNCEMENT';
export const DELETE_ANNOUNCEMENT = 'system/admin/DELETE_ANNOUNCEMENT';
export const SAVE_USERS_LIST = 'system/admin/SAVE_USERS_LIST';
export const SAVE_USER = 'system/admin/SAVE_USER';
export const DELETE_USER = 'system/admin/DELETE_USER';
export const SAVE_COURSE_LIST = 'system/admin/SAVE_COURSE_LIST';
export const DELETE_COURSE = 'system/admin/DELETE_COURSE';
export const SAVE_INSTANCE_LIST = 'system/admin/SAVE_INSTANCE_LIST';
export const SAVE_INSTANCE = 'system/admin/SAVE_INSTANCE';
export const DELETE_INSTANCE = 'system/admin/DELETE_INSTANCE';

// Action Types
export interface SaveAnnouncementsListAction {
  type: typeof SAVE_ANNOUNCEMENTS_LIST;
  announcementList: AnnouncementListData[];
}

export interface SaveAnnouncementAction {
  type: typeof SAVE_ANNOUNCEMENT;
  announcement: AnnouncementData;
}

export interface DeleteAnnouncementAction {
  type: typeof DELETE_ANNOUNCEMENT;
  id: number;
}

export interface SaveUsersListAction {
  type: typeof SAVE_USERS_LIST;
  userList: UserListData[];
  counts: AdminStats;
}
export interface SaveUserAction {
  type: typeof SAVE_USER;
  user: UserListData;
}
export interface DeleteUserAction {
  type: typeof DELETE_USER;
  id: number;
}

export interface SaveCoursesListAction {
  type: typeof SAVE_COURSE_LIST;
  courseList: CourseListData[];
  counts: CourseStats;
}

export interface DeleteCourseAction {
  type: typeof DELETE_COURSE;
  id: number;
}

export interface SaveInstanceListAction {
  type: typeof SAVE_INSTANCE_LIST;
  instanceList: InstanceListData[];
  permissions: InstancePermissions;
  count: number;
}

export interface SaveInstanceAction {
  type: typeof SAVE_INSTANCE;
  instance: InstanceListData;
}

export interface DeleteInstanceAction {
  type: typeof DELETE_INSTANCE;
  id: number;
}

export type AdminActionType =
  | SaveAnnouncementsListAction
  | SaveAnnouncementAction
  | DeleteAnnouncementAction
  | SaveUsersListAction
  | SaveUserAction
  | DeleteUserAction
  | SaveCoursesListAction
  | DeleteCourseAction
  | SaveInstanceListAction
  | SaveInstanceAction
  | DeleteInstanceAction;

// State Types
export interface AdminState {
  announcements: EntityStore<AnnouncementMiniEntity>;
  courses: EntityStore<CourseMiniEntity>;
  instances: EntityStore<InstanceMiniEntity>;
  users: EntityStore<UserMiniEntity>;
  counts: AdminStats;
  permissions: InstancePermissions;
}
