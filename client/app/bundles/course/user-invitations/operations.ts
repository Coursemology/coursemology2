import { Operation } from 'store';
import {
  InvitationFileEntity,
  InvitationPostData,
  InvitationResult,
  InvitationsPostData,
} from 'types/course/userInvitations';

import CourseAPI from 'api/course';

import { actions } from './store';

/**
 * Prepares and maps answer value in the react-hook-form into server side format.
 *
 * @param invitations
 * @returns
 */
const formatInvitations = (invitations: InvitationPostData[]): FormData => {
  const payload = new FormData();

  invitations.forEach((invite, index) => {
    ['name', 'email', 'role', 'phantom', 'timelineAlgorithm'].forEach(
      (field) => {
        if (invite[field] !== undefined && invite[field] !== null) {
          let fieldName = field;
          let value = invite[field];
          if (field === 'timelineAlgorithm') {
            fieldName = 'timeline_algorithm';
          }
          if (field === 'phantom') {
            value = value ? 1 : 0;
          }
          payload.append(
            `course[invitations_attributes][${index}][${fieldName}]`,
            value,
          );
        }
      },
    );
  });
  return payload;
};

export function fetchInvitations(): Operation {
  return async (dispatch) =>
    CourseAPI.userInvitations.index().then((response) => {
      const data = response.data;
      dispatch(
        actions.saveInvitationList(
          data.invitations,
          data.permissions,
          data.manageCourseUsersData,
        ),
      );
    });
}

export function fetchPermissionsAndSharedData(): Operation {
  return async (dispatch) =>
    CourseAPI.userInvitations.getPermissionsAndSharedData().then((response) => {
      dispatch(actions.savePermissions(response.data.permissions));
      dispatch(actions.saveSharedData(response.data.manageCourseUsersData));
    });
}

export function inviteUsersFromFile(
  fileEntity: InvitationFileEntity,
): Operation<InvitationResult> {
  return async (dispatch) =>
    CourseAPI.userInvitations.invite(fileEntity).then((response) => {
      const data = response.data;
      dispatch(actions.updateInvitationCounts(data.newInvitations));
      return JSON.parse(data.invitationResult);
    });
}

export function inviteUsersFromForm(
  postData: InvitationsPostData,
): Operation<InvitationResult> {
  const formattedData = formatInvitations(postData.invitations);
  return async (dispatch) =>
    CourseAPI.userInvitations.invite(formattedData).then((response) => {
      const data = response.data;
      dispatch(actions.updateInvitationCounts(data.newInvitations));
      return JSON.parse(data.invitationResult);
    });
}

export function resendAllInvitations(): Operation {
  return async (dispatch) =>
    CourseAPI.userInvitations.resendAllInvitations().then((response) => {
      dispatch(actions.updateInvitationList(response.data.invitations));
    });
}

export function resendInvitationEmail(invitationId: number): Operation {
  return async (dispatch) =>
    CourseAPI.userInvitations
      .resendInvitationEmail(invitationId)
      .then((response) => {
        dispatch(actions.updateInvitation(response.data));
      });
}

export function deleteInvitation(invitationId: number): Operation {
  return async (dispatch) =>
    CourseAPI.userInvitations.delete(invitationId).then(() => {
      dispatch(actions.deleteInvitation(invitationId));
    });
}

export function fetchRegistrationCode(): Operation {
  return async (dispatch) =>
    CourseAPI.userInvitations.getCourseRegistrationKey().then((response) => {
      dispatch(
        actions.saveRegistrationKey(response.data.courseRegistrationKey),
      );
    });
}

export function toggleRegistrationCode(shouldEnable: boolean): Operation {
  return async (dispatch) =>
    CourseAPI.userInvitations
      .toggleCourseRegistrationKey(shouldEnable)
      .then((response) => {
        dispatch(
          actions.saveRegistrationKey(response.data.courseRegistrationKey),
        );
      });
}
