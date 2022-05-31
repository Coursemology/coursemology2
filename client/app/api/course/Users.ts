import { AxiosResponse } from 'axios';
import { UserData, UserListData, UserPermissions } from 'types/course/users';
import BaseCourseAPI from './Base';

export default class UsersAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/users`;
  }

  /**
   * Fetches a list of users in a course.
   */
  index(): Promise<
    AxiosResponse<{
      users: UserListData[];
      permissions: UserPermissions;
    }>
  > {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Fetches a user.
   */
  fetch(userId: number): Promise<
    AxiosResponse<{
      user: UserData;
    }>
  > {
    return this.getClient().get(`${this._getUrlPrefix()}/${userId}`);
  }
}
