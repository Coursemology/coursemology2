import {
  ManageCourseUsersPermissions,
  ManageCourseUsersTabData,
} from 'types/course/course_users';
import { InvitationData } from 'types/course/user_invitations';
import {
  DeleteInvitationAction,
  DELETE_INVITATION,
  SaveInvitationListAction,
  SAVE_INVITATION_LIST,
} from './types';

export function saveInvitationList(
  invitationList: InvitationData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
  manageCourseUsersData: ManageCourseUsersTabData,
): SaveInvitationListAction {
  return {
    type: SAVE_INVITATION_LIST,
    invitationList,
    manageCourseUsersPermissions,
    manageCourseUsersData,
  };
}

export function deleteInvitation(invitationId: number): DeleteInvitationAction {
  return {
    type: DELETE_INVITATION,
    invitationId,
  };
}
