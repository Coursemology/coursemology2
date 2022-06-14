import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { InvitationData, InvitationEntity } from 'types/course/userInvitations';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_INVITATION_LIST =
  'course/userInvitations/SAVE_INVITATION_LIST';
export const DELETE_INVITATION = 'course/userInvitations/DELETE_INVITATION';
export const SAVE_COURSE_REGISTRATION_KEY =
  'course/userInvitations/SAVE_COURSE_REGISTRATION_KEY';
export const SAVE_COURSE_USERS_DATA = 'course/users/SAVE_COURSE_USERS_DATA';

// Action Types
export interface SaveInvitationListAction {
  type: typeof SAVE_INVITATION_LIST;
  invitationList: InvitationData[];
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

export type InvitationsActionType =
  | SaveInvitationListAction
  | DeleteInvitationAction
  | SaveCourseRegistrationKeyAction;

// State Types
export interface InvitationsState {
  invitations: EntityStore<InvitationEntity, InvitationEntity>;
  permissions: ManageCourseUsersPermissions;
  manageCourseUsersData: ManageCourseUsersSharedData;
  courseRegistrationKey: string;
}
