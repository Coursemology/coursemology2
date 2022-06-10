import {
  ManageCourseUsersPermissions,
  ManageCourseUsersTabData,
} from 'types/course/courseUsers';
import { InvitationData } from 'types/course/userInvitations';
import {
  DeleteInvitationAction,
  DELETE_INVITATION,
  SaveCourseRegistrationKeyAction,
  SaveInvitationListAction,
  SAVE_COURSE_REGISTRATION_KEY,
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

export function saveRegistrationKey(
  courseRegistrationKey: string,
): SaveCourseRegistrationKeyAction {
  return {
    type: SAVE_COURSE_REGISTRATION_KEY,
    courseRegistrationKey,
  };
}
