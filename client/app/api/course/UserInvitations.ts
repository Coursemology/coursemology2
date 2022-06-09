import { AxiosResponse } from 'axios';
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersTabData,
} from 'types/course/courseUsers';
import { InvitationData } from 'types/course/userInvitations';
import BaseCourseAPI from './Base';

export default class UserInvitationsAPI extends BaseCourseAPI {
  _baseUrlPrefix: string = `/courses/${this.getCourseId()}`;

  /**
   * Fetches data from user invitations index
   */
  index(): Promise<
    AxiosResponse<{
      invitations: InvitationData[];
      permissions: ManageCourseUsersPermissions;
      manageCourseUsersData: ManageCourseUsersTabData;
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/user_invitations`);
  }

  /**
   * Resends all invitation emails.
   *
   * @return {Promise}
   * success response: { }
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  resendAllInvitations(): Promise<AxiosResponse> {
    return this.getClient().post(
      `${this._baseUrlPrefix}/users/resend_invitations`,
    );
  }

  /**
   * Resends an invitation email.
   *
   * @return {Promise}
   * success response: { }
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  resendInvitationEmail(invitationId: number): Promise<AxiosResponse> {
    return this.getClient().post(
      `${this._baseUrlPrefix}/user_invitations/${invitationId}/resend_invitation`,
    );
  }

  /**
   * Deletes an invitation.
   *
   * @return {Promise}
   * success response: { }
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  delete(invitationId: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this._baseUrlPrefix}/${invitationId}`);
  }
}
