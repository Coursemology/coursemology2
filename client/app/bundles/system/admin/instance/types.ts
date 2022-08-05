import { EntityStore } from 'types/store';
import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementMiniEntity,
} from 'types/system/announcements';
import { CourseMiniEntity, CourseStats } from 'types/system/courses';
import { CourseListData } from 'types/system/instance/courses';
import {
  ComponentListData,
  ComponentMiniEntity,
} from 'types/system/instance/components';
import {
  RoleRequestListData,
  RoleRequestMiniEntity,
} from 'types/system/instance/roleRequests';
import {
  InstanceBasicListData,
  InstanceBasicMiniEntity,
  InstancePermissions,
} from 'types/system/instances';
import {
  InstanceUserListData,
  InstanceAdminStats,
  InstanceUserMiniEntity,
} from 'types/system/instance/users';
import {
  InvitationListData,
  InvitationMiniEntity,
} from 'types/system/instance/invitations';

// Action Names
export const SAVE_INSTANCE = 'system/instance/SAVE_INSTANCE';
export const SAVE_ANNOUNCEMENTS_LIST =
  'system/instance/SAVE_ANNOUNCEMENTS_LIST';
export const SAVE_ANNOUNCEMENT = 'system/instance/SAVE_ANNOUNCEMENT';
export const DELETE_ANNOUNCEMENT = 'system/instance/DELETE_ANNOUNCEMENT';
export const SAVE_USERS_LIST = 'system/instance/SAVE_USERS_LIST';
export const SAVE_USER = 'system/instance/SAVE_USER';
export const DELETE_USER = 'system/instance/DELETE_USER';
export const SAVE_COURSE_LIST = 'system/instance/SAVE_COURSE_LIST';
export const DELETE_COURSE = 'system/instance/DELETE_COURSE';
export const SAVE_COMPONENTS_LIST = 'system/instance/SAVE_COMPONENTS_LIST';
export const SAVE_ROLE_REQUESTS_LIST =
  'system/instance/SAVE_ROLE_REQUESTS_LIST';
export const UPDATE_ROLE_REQUEST = 'system/instance/UPDATE_ROLE_REQUEST';
export const SAVE_USER_INVITATIONS_LIST =
  'system/instance/SAVE_USER_INVITATIONS_LIST';
export const UPDATE_INVITATION = 'system/instance/UPDATE_INVITATION';
export const UPDATE_INVITATION_LIST = 'system/instance/UPDATE_INVITATION_LIST';
export const DELETE_INVITATION = 'system/instance/DELETE_INVITATION';

// Action Types
export interface SaveInstanceAction {
  type: typeof SAVE_INSTANCE;
  instance: InstanceBasicListData;
}

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

export interface SaveCoursesListAction {
  type: typeof SAVE_COURSE_LIST;
  courseList: CourseListData[];
  counts: CourseStats;
}

export interface DeleteCourseAction {
  type: typeof DELETE_COURSE;
  id: number;
}

export interface SaveComponentsListAction {
  type: typeof SAVE_COMPONENTS_LIST;
  componentsList: {
    enabled?: ComponentListData[];
    disabled?: ComponentListData[];
  };
}

export interface SaveRoleRequestsListAction {
  type: typeof SAVE_ROLE_REQUESTS_LIST;
  roleRequests: RoleRequestListData[];
}

export interface UpdateRoleRequestAction {
  type: typeof UPDATE_ROLE_REQUEST;
  roleRequest: RoleRequestListData;
}

export interface SaveUserInvitationsListAction {
  type: typeof SAVE_USER_INVITATIONS_LIST;
  invitations: InvitationListData[];
}

export interface UpdateInvitationAction {
  type: typeof UPDATE_INVITATION;
  invitation: InvitationListData;
}

export interface UpdateInvitationListAction {
  type: typeof UPDATE_INVITATION_LIST;
  invitationList: InvitationListData[];
}

export interface DeleteInvitationAction {
  type: typeof DELETE_INVITATION;
  invitationId: number;
}

export type InstanceAdminActionType =
  | SaveInstanceAction
  | SaveAnnouncementsListAction
  | SaveAnnouncementAction
  | DeleteAnnouncementAction
  | SaveUsersListAction
  | SaveUserAction
  | DeleteUserAction
  | SaveCoursesListAction
  | DeleteCourseAction
  | SaveComponentsListAction
  | SaveRoleRequestsListAction
  | UpdateRoleRequestAction
  | SaveUserInvitationsListAction
  | UpdateInvitationAction
  | UpdateInvitationListAction
  | DeleteInvitationAction;

// State Types
export interface InstanceAdminState {
  announcements: EntityStore<AnnouncementMiniEntity>;
  courses: EntityStore<CourseMiniEntity>;
  components: EntityStore<ComponentMiniEntity>;
  roleRequests: EntityStore<RoleRequestMiniEntity>;
  users: EntityStore<InstanceUserMiniEntity>;
  invitations: EntityStore<InvitationMiniEntity>;
  instance: InstanceBasicMiniEntity;
  counts: InstanceAdminStats;
  permissions: InstancePermissions;
}
