/* eslint class-methods-use-this: "off" */
import { AxiosResponse } from 'axios';

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

type Response<Data> = Promise<AxiosResponse<Data>>;

class UsersAPI extends BaseAPI {
  _getUrlPrefix(): string {
    return '/users';
  }

  /**
   * Fetches information for user show
   */
  fetch(userId: number): Response<{
    user: UserBasicMiniEntity;
    currentCourses: UserCourseListData[];
    completedCourses: UserCourseListData[];
    instances: InstanceBasicListData[];
  }> {
    return this.getClient().get(`${this._getUrlPrefix()}/${userId}`);
  }

  fetchProfile(): Response<ProfileData> {
    return this.getClient().get('/user/profile/edit');
  }

  fetchEmails(): Response<EmailsData> {
    return this.getClient().get('/user/emails');
  }

  updateProfile(data: ProfilePostData): Response<ProfileData> {
    return this.getClient().patch('/user/profile', data);
  }

  updateProfilePicture(image: File): Response<ProfileData> {
    const formData = new FormData();
    formData.append('user[profile_photo]', image);
    return this.getClient().patch('/user/profile', formData);
  }

  addEmail(data: EmailPostData): Response<EmailsData> {
    return this.getClient().post('/user/emails', data);
  }

  removeEmail(emailId: EmailData['id']): Response<EmailsData> {
    return this.getClient().delete(`/user/emails/${emailId}`);
  }

  updatePassword(data: PasswordPostData): Promise<AxiosResponse> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }

  fetchTimeZones(): Response<TimeZones> {
    return this.getClient().get('/user/profile/time_zones');
  }

  setEmailAsPrimary(
    url: NonNullable<EmailData['setPrimaryUserEmailPath']>,
  ): Response<EmailsData> {
    return this.getClient().post(url);
  }

  resendConfirmationEmail(
    url: NonNullable<EmailData['confirmationEmailPath']>,
  ): Promise<AxiosResponse> {
    return this.getClient().post(url);
  }
}

const GlobalUsersAPI = {
  users: new UsersAPI(),
};

Object.freeze(GlobalUsersAPI);

export default GlobalUsersAPI;
