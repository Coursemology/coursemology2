import { AxiosResponse } from 'axios';
import {
  CourseData,
  CourseListData,
  CoursePermissions,
} from 'types/course/courses';
import BaseCourseAPI from './Base';

export default class CoursesAPI extends BaseCourseAPI {
  _baseUrlPrefix: string = '/courses';

  /**
   * Fetches all of the courses
   */
  index(): Promise<
    AxiosResponse<{
      courses: CourseListData[];
      instanceUserRoleRequestId: number;
      permissions: CoursePermissions;
    }>
  > {
    return this.getClient().get(this._baseUrlPrefix);
  }

  /**
   * Fetches one course
   */
  fetch(courseId: number): Promise<
    AxiosResponse<{
      course: CourseData;
    }>
  > {
    return this.getClient().get(`${this._baseUrlPrefix}/${courseId}`);
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

  create(params: FormData): Promise<
    AxiosResponse<{
      id: number;
      title: string;
    }>
  > {
    return this.getClient().post(this._baseUrlPrefix, params);
  }

  /**
   * Removes a todo
   */
  removeTodo(ignoreLink: string): Promise<void> {
    return this.getClient().post(ignoreLink);
  }

  /**
   * Submits a registration code
   */
  sendNewRegistrationCode(
    registrationLink: string,
    myData: FormData,
  ): Promise<AxiosResponse<void>> {
    return this.getClient().postForm(registrationLink, myData);
  }

  /**
   * Submits an enrol request
   */

  submitEnrolRequest(link: string): Promise<AxiosResponse<{ id: number }>> {
    return this.getClient().postForm(link);
  }

  /**
   * Cancels a pending enrol request
   */
  cancelEnrolRequest(link: string): Promise<AxiosResponse<void>> {
    return this.getClient().delete(link);
  }
}
