import { AxiosResponse } from 'axios';
import {
  DisbursementCourseGroupListData,
  DisbursementCourseUserListData,
  ForumDisbursementFilters,
  ForumDisbursementFilterParams,
  ForumDisbursementUserData,
} from 'types/course/disbursement';
import BaseCourseAPI from './Base';

export default class DisbursementAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/users/disburse_experience_points`;
  }

  _getForumDisbursementUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/users/forum_disbursement`;
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
    return this.getClient().get(this._getUrlPrefix());
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
    return this.getClient().get(this._getForumDisbursementUrlPrefix(), params);
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
    return this.getClient().post(this._getUrlPrefix(), params);
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
    return this.getClient().post(this._getForumDisbursementUrlPrefix(), params);
  }
}
