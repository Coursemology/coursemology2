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
  _getUrlPrefix(): string {
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
    return this.getClient().get(`${this._getUrlPrefix()}/${userId}`);
  }

  fetchProfile(): APIResponse<ProfileData> {
    return this.getClient().get('/user/profile/edit');
  }

  fetchEmails(): APIResponse<EmailsData> {
    return this.getClient().get('/user/emails');
  }

  updateProfile(data: ProfilePostData): APIResponse<ProfileData> {
    return this.getClient().patch('/user/profile', data);
  }

  updateProfilePicture(image: File): APIResponse<ProfileData> {
    const formData = new FormData();
    formData.append('user[profile_photo]', image);
    return this.getClient().patch('/user/profile', formData);
  }

  addEmail(data: EmailPostData): APIResponse<EmailsData> {
    return this.getClient().post('/user/emails', data);
  }

  removeEmail(emailId: EmailData['id']): APIResponse<EmailsData> {
    return this.getClient().delete(`/user/emails/${emailId}`);
  }

  updatePassword(data: PasswordPostData): APIResponse {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }

  fetchTimeZones(): APIResponse<TimeZones> {
    return this.getClient().get('/user/profile/time_zones');
  }

  setEmailAsPrimary(
    url: NonNullable<EmailData['setPrimaryUserEmailPath']>,
  ): APIResponse<EmailsData> {
    return this.getClient().post(url);
  }

  resendConfirmationEmail(
    url: NonNullable<EmailData['confirmationEmailPath']>,
  ): APIResponse {
    return this.getClient().post(url);
  }
}
