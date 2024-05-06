import { TimeZones } from 'types/course/admin/course';
import { InstanceBasicListData } from 'types/system/instances';
import {
  EmailData,
  EmailPostData,
  EmailsData,
  InvitedSignUpData,
  PasswordPostData,
  ProfileData,
  ProfilePostData,
  UserBasicMiniEntity,
  UserCourseListData,
} from 'types/users';

import BaseAPI from './Base';
import { APIResponse } from './types';

export default class UsersAPI extends BaseAPI {
  // eslint-disable-next-line class-methods-use-this
  get #urlPrefix(): string {
    return '/users';
  }

  /**
   * Fetches information for user show
   */
  fetch(userId: number): APIResponse<{
    user: UserBasicMiniEntity;
    currentCourses: UserCourseListData[];
    completedCourses: UserCourseListData[];
    instances: InstanceBasicListData[];
  }> {
    return this.client.get(`${this.#urlPrefix}/${userId}`);
  }

  fetchProfile(): APIResponse<ProfileData> {
    return this.client.get('/user/profile/edit');
  }

  fetchEmails(): APIResponse<EmailsData> {
    return this.client.get('/user/emails');
  }

  updateProfile(data: ProfilePostData): APIResponse<ProfileData> {
    return this.client.patch('/user/profile', data);
  }

  updateProfilePicture(image: File): APIResponse<ProfileData> {
    const formData = new FormData();
    formData.append('user[profile_photo]', image);
    return this.client.patch('/user/profile', formData);
  }

  addEmail(data: EmailPostData): APIResponse<EmailsData> {
    return this.client.post('/user/emails', data);
  }

  removeEmail(emailId: EmailData['id']): APIResponse<EmailsData> {
    return this.client.delete(`/user/emails/${emailId}`);
  }

  updatePassword(data: PasswordPostData): APIResponse {
    return this.client.patch(this.#urlPrefix, data);
  }

  fetchTimeZones(): APIResponse<TimeZones> {
    return this.client.get('/user/profile/time_zones');
  }

  setEmailAsPrimary(
    url: NonNullable<EmailData['setPrimaryUserEmailPath']>,
  ): APIResponse<EmailsData> {
    return this.client.post(url);
  }

  resendConfirmationEmailByURL(
    url: NonNullable<EmailData['confirmationEmailPath']>,
  ): APIResponse {
    return this.client.post(url);
  }

  signOut(): APIResponse {
    return this.client.delete(`${this.#urlPrefix}/sign_out`);
  }

  signUp(
    name: string,
    email: string,
    password: string,
    captchaResponse: string,
    invitation?: string,
  ): APIResponse<{ id: number | null; confirmed: boolean }> {
    const formData = new FormData();

    formData.append('user[name]', name);
    formData.append('user[email]', email);
    formData.append('user[password]', password);
    formData.append('user[password_confirmation]', password);
    formData.append('g-recaptcha-response', captchaResponse);
    if (invitation) formData.append('invitation', invitation);

    return this.client.post(this.#urlPrefix, formData);
  }

  verifyInvitationToken(token: string): APIResponse<InvitedSignUpData | null> {
    return this.client.get(`${this.#urlPrefix}/sign_up`, {
      params: { invitation: token },
    });
  }

  requestResetPassword(email: string): APIResponse {
    const formData = new FormData();

    formData.append('user[email]', email);

    return this.client.post(`${this.#urlPrefix}/password`, formData);
  }

  resendConfirmationEmail(email: string): APIResponse {
    const formData = new FormData();

    formData.append('user[email]', email);

    return this.client.post(`${this.#urlPrefix}/confirmation`, formData);
  }

  verifyResetPasswordToken(token: string): APIResponse<{ email: string }> {
    return this.client.get(`${this.#urlPrefix}/password/edit`, {
      params: { reset_password_token: token },
    });
  }

  resetPassword(token: string, password: string): APIResponse {
    const formData = new FormData();

    formData.append('user[reset_password_token]', token);
    formData.append('user[password]', password);
    formData.append('user[password_confirmation]', password);

    return this.client.patch(`${this.#urlPrefix}/password`, formData);
  }

  confirmEmail(token: string): APIResponse<{ email: string }> {
    return this.client.get(`${this.#urlPrefix}/confirmation`, {
      params: { confirmation_token: token },
    });
  }
}
