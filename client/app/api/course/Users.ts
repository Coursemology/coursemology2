import { AxiosResponse } from 'axios';
import { CourseUserData, CourseUserListData } from 'types/course/course_users';
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
      users: CourseUserListData[];
    }>
  > {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Fetches a user with detailed information in a course.
   */
  fetch(userId: number): Promise<
    AxiosResponse<{
      user: CourseUserData;
    }>
  > {
    return this.getClient().get(`${this._getUrlPrefix()}/${userId}`);
  }
}
