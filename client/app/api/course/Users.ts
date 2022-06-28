import { AxiosResponse } from 'axios';
import {
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
  CourseUserData,
  CourseUserListData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
  StaffRole,
  UpdateCourseUserPatchData,
} from 'types/course/courseUsers';
import BaseCourseAPI from './Base';

export default class UsersAPI extends BaseCourseAPI {
  _baseUrlPrefix: string = `/courses/${this.getCourseId()}`;

  /**
   * Fetches a list of users in a course.
   * Note that GET /users returns only students if asBasicData is false.
   * Otherwise, GET /users will return BasicListData of all course users when asBasicData is true.
   *
   * param asBasicData: bool - whether to return users: CourseUserListData[] or
   *                           as userOptions: CourseUserBasicListData[]
   */
  index(asBasicData: boolean = false): Promise<
    AxiosResponse<{
      users: CourseUserListData[];
      userOptions?: CourseUserBasicListData[];
      permissions?: ManageCourseUsersPermissions;
      manageCourseUsersData?: ManageCourseUsersSharedData;
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/users`, {
      params: { as_basic_data: asBasicData },
    });
  }

  /**
   * Fetches a list of students in a course.
   */
  indexStudents(): Promise<
    AxiosResponse<{
      users: CourseUserListData[];
      permissions: ManageCourseUsersPermissions;
      manageCourseUsersData: ManageCourseUsersSharedData;
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/students`);
  }

  /**
   * Fetches a list of staff in a course.
   */
  indexStaff(): Promise<
    AxiosResponse<{
      users: CourseUserListData[];
      userOptions?: CourseUserBasicListData[];
      permissions: ManageCourseUsersPermissions;
      manageCourseUsersData: ManageCourseUsersSharedData;
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
   * @param {CourseUserBasicMiniEntity[]} users
   * @param {StaffRole} role
   * @return {Promise} list of upgraded users
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  upgradeToStaff(
    users: CourseUserBasicMiniEntity[],
    role: StaffRole,
  ): Promise<AxiosResponse> {
    const userIds = users.map((user) => user.id);
    const params = {
      course_users: {
        ids: userIds,
        role,
      },
      user: {
        id: userIds[0],
      },
    };

    return this.getClient().patch(
      `${this._baseUrlPrefix}/upgrade_to_staff`,
      params,
    );
  }
}
