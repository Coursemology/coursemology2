/* eslint class-methods-use-this: "off" */
import { AxiosResponse } from 'axios';
import { InstanceBasicListData } from 'types/system/instances';
import { UserBasicMiniEntity, UserCourseListData } from 'types/users';
import BaseAPI from './Base';

class UsersAPI extends BaseAPI {
  _getUrlPrefix(): string {
    return `/users`;
  }

  /**
   * Fetches information for user show
   */
  fetch(userId: number): Promise<
    AxiosResponse<{
      user: UserBasicMiniEntity;
      currentCourses: UserCourseListData[];
      completedCourses: UserCourseListData[];
      instances: InstanceBasicListData[];
    }>
  > {
    return this.getClient().get(`${this._getUrlPrefix()}/${userId}`);
  }
}

const GlobalUsersAPI = {
  users: new UsersAPI(),
};

Object.freeze(GlobalUsersAPI);

export default GlobalUsersAPI;
