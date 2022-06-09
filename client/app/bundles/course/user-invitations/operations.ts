import CourseAPI from 'api/course';
import { AxiosResponse } from 'axios';
import { Operation } from 'types/store';
import * as actions from './actions';

export function fetchInvitations(): Operation<void> {
  return async (dispatch) =>
    CourseAPI.userInvitations
      .index()
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.saveInvitationList(
            data.invitations,
            data.permissions,
            data.manageCourseUsersData,
          ),
        );
      })
      .catch((error) => {
        throw error;
      });
}

export function resendAllInvitations(): Operation<
  AxiosResponse<unknown, unknown>
> {
  return async (_) =>
    CourseAPI.userInvitations.resendAllInvitations().catch((error) => {
      throw error;
    });
}

export function resendInvitationEmail(
  invitationId: number,
): Operation<AxiosResponse<unknown, unknown>> {
  return async (_) =>
    CourseAPI.userInvitations
      .resendInvitationEmail(invitationId)
      .catch((error) => {
        throw error;
      });
}

export function deleteInvitation(invitationId: number): Operation<void> {
  return async (dispatch) =>
    CourseAPI.userInvitations.delete(invitationId).then(() => {
      dispatch(actions.deleteInvitation(invitationId));
    });
}
