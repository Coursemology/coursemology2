import { TimeZones } from 'types/course/admin/course';
import { InstanceBasicListData } from 'types/system/instances';
import {
  EmailData,
  EmailPostData,
  EmailsData,
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

  resendConfirmationEmail(
    url: NonNullable<EmailData['confirmationEmailPath']>,
  ): APIResponse {
    return this.client.post(url);
  }

  signOut(url: string): APIResponse {
    return this.client.delete(url);
  }
}
