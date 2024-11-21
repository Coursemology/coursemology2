import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import {
  InvitationListData,
  InvitationMiniEntity,
} from 'types/course/userInvitations';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_INVITATION_LIST =
  'course/userInvitations/SAVE_INVITATION_LIST';
export const DELETE_INVITATION = 'course/userInvitations/DELETE_INVITATION';
export const SAVE_COURSE_REGISTRATION_KEY =
  'course/userInvitations/SAVE_COURSE_REGISTRATION_KEY';
export const SAVE_PERMISSIONS = 'course/userInvitations/SAVE_PERMISSIONS';
export const SAVE_SHARED_DATA = 'course/userInvitations/SAVE_SHARED_DATA';
export const UPDATE_INVITATION = 'course/users/UPDATE_INVITATION';
export const UPDATE_INVITATION_LIST = 'course/users/UPDATE_INVITATION_LIST';
export const UPDATE_INVITATION_COUNTS = 'course/users/UPDATE_INVITATION_COUNTS';

// Action Types
export interface SaveInvitationListAction {
  type: typeof SAVE_INVITATION_LIST;
  invitationList: InvitationListData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
}

export interface DeleteInvitationAction {
  type: typeof DELETE_INVITATION;
  invitationId: number;
}

export interface SaveCourseRegistrationKeyAction {
  type: typeof SAVE_COURSE_REGISTRATION_KEY;
  courseRegistrationKey: string;
}

export interface SavePermissionsAction {
  type: typeof SAVE_PERMISSIONS;
  manageCourseUsersPermissions: ManageCourseUsersPermissions;
}

export interface SaveSharedDataAction {
  type: typeof SAVE_SHARED_DATA;
  manageCourseUsersData: ManageCourseUsersSharedData;
}

export interface UpdateInvitationAction {
  type: typeof UPDATE_INVITATION;
  invitation: InvitationListData;
}

export interface UpdateInvitationListAction {
  type: typeof UPDATE_INVITATION_LIST;
  invitationList: InvitationListData[];
}

export interface UpdateInvitationCountsAction {
  type: typeof UPDATE_INVITATION_COUNTS;
  newInvitations: number;
}

export type InvitationsActionType =
  | SaveInvitationListAction
  | DeleteInvitationAction
  | SaveCourseRegistrationKeyAction
  | SavePermissionsAction
  | SaveSharedDataAction
  | UpdateInvitationAction
  | UpdateInvitationListAction
  | UpdateInvitationCountsAction;

// State Types
export interface InvitationsState {
  invitations: EntityStore<InvitationMiniEntity, InvitationMiniEntity>;
  permissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
  courseRegistrationKey: string;
}

export interface InvitationEntry {
  name: string;
  email: string;
}
