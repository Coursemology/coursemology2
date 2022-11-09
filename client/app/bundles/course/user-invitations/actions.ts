import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import { InvitationListData } from 'types/course/userInvitations';

import {
  DELETE_INVITATION,
  DeleteInvitationAction,
  SAVE_COURSE_REGISTRATION_KEY,
  SAVE_INVITATION_LIST,
  SAVE_PERMISSIONS,
  SAVE_SHARED_DATA,
  SaveCourseRegistrationKeyAction,
  SaveInvitationListAction,
  SavePermissionsAction,
  SaveSharedDataAction,
  UPDATE_INVITATION,
  UPDATE_INVITATION_COUNTS,
  UPDATE_INVITATION_LIST,
  UpdateInvitationAction,
  UpdateInvitationCountsAction,
  UpdateInvitationListAction,
} from './types';

export function saveInvitationList(
  invitationList: InvitationListData[],
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
  manageCourseUsersData: ManageCourseUsersSharedData,
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

export function savePermissions(
  manageCourseUsersPermissions: ManageCourseUsersPermissions,
): SavePermissionsAction {
  return {
    type: SAVE_PERMISSIONS,
    manageCourseUsersPermissions,
  };
}

export function saveSharedData(
  manageCourseUsersData: ManageCourseUsersSharedData,
): SaveSharedDataAction {
  return {
    type: SAVE_SHARED_DATA,
    manageCourseUsersData,
  };
}

export function updateInvitation(
  invitation: InvitationListData,
): UpdateInvitationAction {
  return {
    type: UPDATE_INVITATION,
    invitation,
  };
}

export function updateInvitationList(
  invitationList: InvitationListData[],
): UpdateInvitationListAction {
  return {
    type: UPDATE_INVITATION_LIST,
    invitationList,
  };
}

export function updateInvitationCounts(
  newInvitations: number,
): UpdateInvitationCountsAction {
  return {
    type: UPDATE_INVITATION_COUNTS,
    newInvitations,
  };
}
