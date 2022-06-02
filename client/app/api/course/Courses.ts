import { AxiosResponse } from 'axios';
import { CoursesListData, CoursesPermissions } from 'types/course/courses';
import BaseCourseAPI from './Base';

export default class CoursesAPI extends BaseCourseAPI {
  _baseUrlPrefix: string = '/courses';

  /**
   * Fetches all of the courses
   */
  index(): Promise<
    AxiosResponse<{
      courses: CoursesListData[];
      permissions: CoursesPermissions;
    }>
  > {
    return this.getClient().get(this._baseUrlPrefix);
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
}
