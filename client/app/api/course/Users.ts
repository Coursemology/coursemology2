import { AxiosResponse } from 'axios';
import {
  CourseStaffRole,
  CourseUserBasicListData,
  CourseUserBasicMiniEntity,
  CourseUserData,
  CourseUserListData,
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
  UpdateCourseUserPatchData,
} from 'types/course/courseUsers';
import { TimelineData } from 'types/course/referenceTimelines';

import BaseCourseAPI from './Base';

export default class UsersAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}`;
  }

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
    return this.client.get(`${this.#urlPrefix}/users`, {
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
      timelines?: Record<TimelineData['id'], string>;
    }>
  > {
    return this.client.get(`${this.#urlPrefix}/students`);
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
    return this.client.get(`${this.#urlPrefix}/staff`);
  }

  /**
   * Fetches a user with detailed information in a course.
   */
  fetch(userId: number): Promise<
    AxiosResponse<{
      user: CourseUserData;
    }>
  > {
    return this.client.get(`${this.#urlPrefix}/users/${userId}`);
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
    return this.client.delete(`${this.#urlPrefix}/users/${userId}`);
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
    return this.client.patch(`${this.#urlPrefix}/users/${userId}`, params);
  }

  /**
   * Upgrade a user to staff.
   *
   * @param {CourseUserBasicMiniEntity[]} users
   * @param {CourseStaffRole} role
   * @return {Promise} list of upgraded users
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  upgradeToStaff(
    users: CourseUserBasicMiniEntity[],
    role: CourseStaffRole,
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

    return this.client.patch(`${this.#urlPrefix}/upgrade_to_staff`, params);
  }

  assignToTimeline(
    ids: CourseUserBasicMiniEntity['id'][],
    timelineId: TimelineData['id'],
  ): Promise<AxiosResponse> {
    const params = { course_users: { ids, reference_timeline_id: timelineId } };

    return this.client.patch(
      `${this.#urlPrefix}/users/assign_timeline`,
      params,
    );
  }
}
