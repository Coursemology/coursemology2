import {
  AnnouncementData,
  AnnouncementEntity,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { EntityStore } from 'types/store';
import {
  CourseListData,
  CourseMiniEntity,
  CourseStats,
} from 'types/system/courses';
import { ComponentData } from 'types/system/instance/components';
import {
  InvitationListData,
  InvitationMiniEntity,
} from 'types/system/instance/invitations';
import {
  RoleRequestListData,
  RoleRequestMiniEntity,
} from 'types/system/instance/roleRequests';
import {
  InstanceAdminStats,
  InstanceUserListData,
  InstanceUserMiniEntity,
} from 'types/system/instance/users';
import { InstancePermissions } from 'types/system/instances';

// Action Names
export const SAVE_ANNOUNCEMENT_LIST = 'system/instance/SAVE_ANNOUNCEMENT_LIST';
export const SAVE_ANNOUNCEMENT = 'system/instance/SAVE_ANNOUNCEMENT';
export const DELETE_ANNOUNCEMENT = 'system/instance/DELETE_ANNOUNCEMENT';
export const SAVE_USER_LIST = 'system/instance/SAVE_USER_LIST';
export const SAVE_USER = 'system/instance/SAVE_USER';
export const DELETE_USER = 'system/instance/DELETE_USER';
export const SAVE_COURSE_LIST = 'system/instance/SAVE_COURSE_LIST';
export const DELETE_COURSE = 'system/instance/DELETE_COURSE';
export const SAVE_ROLE_REQUEST_LIST = 'system/instance/SAVE_ROLE_REQUEST_LIST';
export const SAVE_ROLE_REQUEST = 'system/instance/SAVE_ROLE_REQUEST';
export const SAVE_INVITATION = 'system/instance/SAVE_INVITATION';
export const SAVE_INVITATION_LIST = 'system/instance/SAVE_INVITATION_LIST';
export const DELETE_INVITATION = 'system/instance/DELETE_INVITATION';
export const SAVE_COMPONENT_LIST = 'system/instance/SAVE_COMPONENT_LIST';

// Action Types
export interface SaveAnnouncementListAction {
  type: typeof SAVE_ANNOUNCEMENT_LIST;
  announcementList: AnnouncementData[];
  announcementPermissions: AnnouncementPermissions;
}

export interface SaveAnnouncementAction {
  type: typeof SAVE_ANNOUNCEMENT;
  announcement: AnnouncementData;
}

export interface DeleteAnnouncementAction {
  type: typeof DELETE_ANNOUNCEMENT;
  id: number;
}

export interface SaveUserListAction {
  type: typeof SAVE_USER_LIST;
  userList: InstanceUserListData[];
  counts: InstanceAdminStats;
}
export interface SaveUserAction {
  type: typeof SAVE_USER;
  user: InstanceUserListData;
}
export interface DeleteUserAction {
  type: typeof DELETE_USER;
  id: number;
}

export interface SaveCourseListAction {
  type: typeof SAVE_COURSE_LIST;
  courseList: CourseListData[];
  counts: CourseStats;
}

export interface DeleteCourseAction {
  type: typeof DELETE_COURSE;
  id: number;
}

export interface SaveRoleRequestListAction {
  type: typeof SAVE_ROLE_REQUEST_LIST;
  roleRequests: RoleRequestListData[];
}

export interface SaveRoleRequestAction {
  type: typeof SAVE_ROLE_REQUEST;
  roleRequest: RoleRequestListData;
}

export interface SaveInvitationAction {
  type: typeof SAVE_INVITATION;
  invitation: InvitationListData;
}

export interface SaveInvitationListAction {
  type: typeof SAVE_INVITATION_LIST;
  invitationList: InvitationListData[];
}

export interface DeleteInvitationAction {
  type: typeof DELETE_INVITATION;
  invitationId: number;
}

export interface SaveComponentListAction {
  type: typeof SAVE_COMPONENT_LIST;
  components: ComponentData[];
}

export type InstanceAdminActionType =
  | SaveAnnouncementListAction
  | SaveAnnouncementAction
  | DeleteAnnouncementAction
  | SaveUserListAction
  | SaveUserAction
  | DeleteUserAction
  | SaveCourseListAction
  | DeleteCourseAction
  | SaveRoleRequestListAction
  | SaveRoleRequestAction
  | SaveInvitationAction
  | SaveInvitationListAction
  | DeleteInvitationAction
  | SaveComponentListAction;

// State Types
export interface InstanceAdminState {
  announcements: EntityStore<AnnouncementEntity>;
  courses: EntityStore<CourseMiniEntity>;
  roleRequests: EntityStore<RoleRequestMiniEntity>;
  users: EntityStore<InstanceUserMiniEntity>;
  invitations: EntityStore<InvitationMiniEntity>;
  components: ComponentData[];
  counts: InstanceAdminStats;
  permissions: InstancePermissions;
}
