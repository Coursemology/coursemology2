import { AxiosResponse } from 'axios';
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import {
  InvitationFileEntity,
  InvitationListData,
} from 'types/course/userInvitations';

import SubmissionsAPI from './Assessment/Submissions';
import BaseCourseAPI from './Base';

export default class UserInvitationsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}`;
  }

  /**
   * Fetches data from user invitations index
   */
  index(): Promise<
    AxiosResponse<{
      invitations: InvitationListData[];
      permissions: ManageCourseUsersPermissions;
      manageCourseUsersData: ManageCourseUsersSharedData;
    }>
  > {
    return this.client.get(`${this.#urlPrefix}/user_invitations`);
  }

  /**
   * Invites users
   *
   * @param {InvitationFileEntity | FormData} data Invitation file (.csv), or cleaned data from react-hook-form
   * @return {Promise}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  invite(data: InvitationFileEntity | FormData): Promise<
    AxiosResponse<{
      newInvitations: number;
      invitationResult: string; // string which is JSON.parsed to type InvitationResult
    }>
  > {
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

    return this.client.post(
      `${this.#urlPrefix}/users/invite`,
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
    return this.client.get(`${this.#urlPrefix}/users/invite`);
  }

  /**
   * Fetches permissions & shared course data.
   */
  getPermissionsAndSharedData(): Promise<
    AxiosResponse<{
      permissions: ManageCourseUsersPermissions;
      manageCourseUsersData: ManageCourseUsersSharedData;
    }>
  > {
    return this.client.get(
      `${this.#urlPrefix}/user_invitations?without_invitations=true`,
    );
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
    return this.client.post(
      `${this.#urlPrefix}/users/toggle_registration`,
      params,
    );
  }

  /**
   * Get path to download template csv file
   */
  getTemplateCsvPath(): Promise<
    AxiosResponse<{
      templatePath: string;
    }>
  > {
    return this.client.get(`${this.#urlPrefix}/users/invite`);
  }

  /**
   * Resends all invitation emails.
   *
   * @return {Promise} updated invitations
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  resendAllInvitations(): Promise<
    AxiosResponse<{ invitations: InvitationListData[] }>
  > {
    return this.client.post(`${this.#urlPrefix}/users/resend_invitations`);
  }

  /**
   * Resends an invitation email.
   *
   * @param {number} invitationId Invitation to resend email to
   * @return {Promise} updated invitation
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  resendInvitationEmail(
    invitationId: number,
  ): Promise<AxiosResponse<InvitationListData>> {
    return this.client.post(
      `${this.#urlPrefix}/user_invitations/${invitationId}/resend_invitation`,
    );
  }

  /**
   * Deletes an invitation.
   *
   * @param {number} invitationId Invitation to delete
   * @return {Promise}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  delete(invitationId: number): Promise<AxiosResponse> {
    return this.client.delete(
      `${this.#urlPrefix}/user_invitations/${invitationId}`,
    );
  }
}
