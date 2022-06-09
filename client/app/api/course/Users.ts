import { AxiosResponse } from 'axios';
import {
  CourseUserData,
  CourseUserListData,
  ManageCourseUsersPermissions,
  ManageCourseUsersTabData,
  UpdateCourseUserPatchData,
} from 'types/course/courseUsers';
import BaseCourseAPI from './Base';

export default class UsersAPI extends BaseCourseAPI {
  _baseUrlPrefix: string = `/courses/${this.getCourseId()}`;

  /**
   * Fetches a list of users in a course.
   */
  index(): Promise<
    AxiosResponse<{
      users: CourseUserListData[];
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/users`);
  }

  /**
   * Fetches a list of students in a course.
   */
  indexStudents(): Promise<
    AxiosResponse<{
      users: CourseUserData[];
      permissions: ManageCourseUsersPermissions;
      manageCourseUsersData: ManageCourseUsersTabData;
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/students`);
  }

  /**
   * Fetches a list of staff in a course.
   */
  indexStaff(): Promise<
    AxiosResponse<{
      users: CourseUserData[];
      permissions: ManageCourseUsersPermissions;
      manageCourseUsersData: ManageCourseUsersTabData;
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/staff`);
  }

  /**
   * Fetches a user with detailed information in a course.
   */
  fetch(userId: number): Promise<
    AxiosResponse<{
      user: CourseUserData;
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/users/${userId}`);
  }

  /**
   * Deletes a user.
   *
   * @param {number} userId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  delete(userId: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${this._baseUrlPrefix}/users/${userId}`);
  }

  /**
   * Updates a user.
   *
   * @param {number} userId
   * @param {UpdateCourseUserPatchData} params - params in the format of { course_user: { :user_id, :name, :role, etc } }
   * @return {Promise}
   * success response: { user }
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  update(
    userId: number,
    params: UpdateCourseUserPatchData | object,
  ): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${this._baseUrlPrefix}/users/${userId}`,
      params,
    );
  }

  /**
   * Upgrade a user to staff.
   *
   * @param {number} userId
   * @param {string} role
   * @return {Promise}
   * success response: {}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  upgradeToStaff(userId: number, role: string): Promise<AxiosResponse> {
    const params = {
      course_user: {
        id: userId,
        role,
      },
    };

    return this.getClient().patch(
      `${this._baseUrlPrefix}/upgrade_to_staff`,
      params,
    );
  }
}
