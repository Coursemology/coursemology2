import {
  CourseData,
  CourseLayoutData,
  CourseListData,
  CoursePermissions,
} from 'types/course/courses';
import { RoleRequestBasicListData } from 'types/system/instance/roleRequests';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class CoursesAPI extends BaseCourseAPI {
  #baseUrlPrefix: string = '/courses';

  /**
   * Fetches all of the courses
   */
  index(): APIResponse<{
    courses: CourseListData[];
    instanceUserRoleRequest?: RoleRequestBasicListData;
    permissions: CoursePermissions;
  }> {
    return this.client.get(this.#baseUrlPrefix);
  }

  /**
   * Fetches one course
   */
  fetch(courseId: number): APIResponse<{
    course: CourseData;
  }> {
    return this.client.get(`${this.#baseUrlPrefix}/${courseId}`);
  }

  fetchLayout(courseId: number): APIResponse<CourseLayoutData> {
    return this.client.get(`${this.#baseUrlPrefix}/${courseId}/sidebar`);
  }

  /**
   * Creates a course.
   *
   * @param {object} params - params in the format of:
   *   {
   *     course: { :title, :description }
   *   }
   * @return {Promise}
   * success response: { :id } - ID of created course.
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */

  create(params: FormData): APIResponse<{
    id: number;
    title: string;
  }> {
    return this.client.post(this.#baseUrlPrefix, params);
  }

  /**
   * Removes a todo
   */
  removeTodo(ignoreLink: string): APIResponse {
    return this.client.post(ignoreLink);
  }

  /**
   * Submits a registration code
   */
  sendNewRegistrationCode(
    registrationLink: string,
    myData: FormData,
  ): APIResponse {
    return this.client.postForm(registrationLink, myData);
  }

  /**
   * Submits an enrol request
   */

  submitEnrolRequest(link: string): APIResponse<{ id: number }> {
    return this.client.postForm(link);
  }

  /**
   * Cancels a pending enrol request
   */
  cancelEnrolRequest(link: string): APIResponse {
    return this.client.delete(link);
  }
}
