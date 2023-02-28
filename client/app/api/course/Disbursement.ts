import { AxiosResponse } from 'axios';
import {
  DisbursementCourseGroupListData,
  DisbursementCourseUserListData,
  ForumDisbursementFilterParams,
  ForumDisbursementFilters,
  ForumDisbursementUserData,
} from 'types/course/disbursement';

import BaseCourseAPI from './Base';

export default class DisbursementAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/users/disburse_experience_points`;
  }

  get #forumDisbursementUrlPrefix(): string {
    return `/courses/${this.courseId}/users/forum_disbursement`;
  }

  /**
   * Fetches disbursement data.
   */
  index(): Promise<
    AxiosResponse<{
      courseGroups: DisbursementCourseGroupListData[];
      courseUsers: DisbursementCourseUserListData[];
    }>
  > {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Fetches forum disbursement data.
   */
  forumDisbursementIndex(params?: ForumDisbursementFilterParams): Promise<
    AxiosResponse<{
      filters: ForumDisbursementFilters;
      forumUsers: ForumDisbursementUserData[];
    }>
  > {
    return this.client.get(this.#forumDisbursementUrlPrefix, params);
  }

  /**
   * Submit form for disbursement using backend #create.
   *
   * @param {object} params - params in the format of:
   *   experience_points_disbursement: {
   *     reason,
   *     experience_points_records_attributes: [
   *        points_awarded,
   *        course_user_id
   *     ]
   *   }
   * @return {Promise}
   * success response: { :count } - Number of recipients receiving disbursement.
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  create(params: FormData): Promise<
    AxiosResponse<{
      count: number;
    }>
  > {
    return this.client.post(this.#urlPrefix, params);
  }

  /**
   * Submit form for forum disbursement using backend #create.
   *
   * @param {object} params - params in the format of:
   *   experience_points_disbursement: {
   *     reason, start_time, end_time, weekly_cap,
   *     experience_points_records_attributes: [
   *        points_awarded,
   *        course_user_id
   *     ]
   *   }
   * @return {Promise}
   * success response: { :count } - Number of recipients receiving disbursement.
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  forumDisbursementCreate(params: FormData): Promise<
    AxiosResponse<{
      count: number;
    }>
  > {
    return this.client.post(this.#forumDisbursementUrlPrefix, params);
  }
}
