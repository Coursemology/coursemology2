import { AxiosResponse } from 'axios';
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import {
  InvitationData,
  InvitationFileEntity,
} from 'types/course/userInvitations';
import SubmissionsAPI from './Assessment/Submissions';
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
      manageCourseUsersData: ManageCourseUsersSharedData;
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/user_invitations`);
  }

  /**
   * Invites users
   *
   * @param {InvitationFileEntity | FormData} data Invitation file (.csv), or cleaned data from react-hook-form
   * @return {Promise}
   * success response: { }
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  invite(data: InvitationFileEntity | FormData): Promise<AxiosResponse> {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'file_types',
      },
    };

    let formData = new FormData();

    if ('file' in data) {
      const temp = {
        invitations_file: data.file,
      };
      SubmissionsAPI.appendFormData(formData, temp, 'course');
    } else {
      formData = data as FormData;
    }

    return this.getClient().post(
      `${this._baseUrlPrefix}/users/invite`,
      formData,
      config,
    );
  }

  /**
   * Fetches course registration key.
   */
  getCourseRegistrationKey(): Promise<
    AxiosResponse<{
      courseRegistrationKey: string;
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/users/invite`);
  }

  /**
   * Toggles course registration code status.
   */
  toggleCourseRegistrationKey(shouldEnable: boolean): Promise<
    AxiosResponse<{
      courseRegistrationKey: string;
    }>
  > {
    let params;
    if (shouldEnable) {
      params = { course: { registration_key: 'checked' } };
    }
    return this.getClient().post(
      `${this._baseUrlPrefix}/users/toggle_registration`,
      params,
    );
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
   * @param {number} invitationId Invitation to resend email to
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
   * @param {number} invitationId Invitation to delete
   * @return {Promise}
   * success response: { }
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  delete(invitationId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${this._baseUrlPrefix}/user_invitations/${invitationId}`,
    );
  }
}
