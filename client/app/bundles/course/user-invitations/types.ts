import {
  ManageCourseUsersPermissions,
  ManageCourseUsersTabData,
} from 'types/course/course_users';
import {
  InvitationData,
  InvitationEntity,
} from 'types/course/user_invitations';
import { EntityStore } from 'types/store';

// Action Names
export const SAVE_INVITATION_LIST = 'course/users/SAVE_INVITATION_LIST';
export const DELETE_INVITATION = 'course/users/DELETE_INVITATION';

// Action Types
export interface SaveInvitationListAction {
  type: typeof SAVE_INVITATION_LIST;
  invitationList: InvitationData[];
  manageCourseUsersPermissions: ManageCourseUsersPermissions | null;
  manageCourseUsersData: ManageCourseUsersTabData;
}

export interface DeleteInvitationAction {
  type: typeof DELETE_INVITATION;
  invitationId: number;
}

export type InvitationsActionType =
  | SaveInvitationListAction
  | DeleteInvitationAction;

// State Types
export interface InvitationsState {
  invitations: EntityStore<InvitationEntity, InvitationEntity>;
  permissions: ManageCourseUsersPermissions | null;
  manageCourseUsersData: ManageCourseUsersTabData | null;
}
