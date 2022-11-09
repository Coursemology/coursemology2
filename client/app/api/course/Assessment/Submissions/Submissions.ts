import { AxiosResponse } from 'axios';
import {
  SubmissionListData,
  SubmissionPermissions,
  SubmissionsMetaData,
} from 'types/course/assessment/submissions';

import BaseCourseAPI from 'api/course/Base';

export default class SubmissionsAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/assessments/submissions`;
  }

  /**
   * Fetches a list of achievements in a course.
   */
  index(): Promise<
    AxiosResponse<{
      submissions: SubmissionListData[];
      metaData: SubmissionsMetaData;
      permissions: SubmissionPermissions;
    }>
  > {
    return this.getClient().get(this._getUrlPrefix());
  }

  pending(isMyStudents: boolean): Promise<
    AxiosResponse<{
      submissions: SubmissionListData[];
      metaData: SubmissionsMetaData;
      permissions: SubmissionPermissions;
    }>
  > {
    return this.getClient().get(`${this._getUrlPrefix()}/pending`, {
      params: { my_students: isMyStudents },
    });
  }

  category(categoryId: number): Promise<
    AxiosResponse<{
      submissions: SubmissionListData[];
      metaData: SubmissionsMetaData;
      permissions: SubmissionPermissions;
    }>
  > {
    return this.getClient().get(this._getUrlPrefix(), {
      params: { category: categoryId },
    });
  }

  /**
   * Filters submissions based on params
   */
  filter(
    categoryId: number | null,
    assessmentId: number | null,
    groupId: number | null,
    userId: number | null,
    pageNum: number | null,
  ): Promise<
    AxiosResponse<{
      submissions: SubmissionListData[];
      metaData: SubmissionsMetaData;
      permissions: SubmissionPermissions;
    }>
  > {
    const data = this.getClient().get(this._getUrlPrefix(), {
      params: {
        'filter[category_id]': categoryId,
        'filter[assessment_id]': assessmentId,
        'filter[group_id]': groupId,
        'filter[user_id]': userId,
        'filter[page_num]': pageNum,
      },
    });
    return data;
  }

  /**
   * Filters pending submissions, used for pagination
   */
  filterPending(
    myStudents: boolean,
    pageNum: number | null,
  ): Promise<
    AxiosResponse<{
      submissions: SubmissionListData[];
      metaData: SubmissionsMetaData;
      permissions: SubmissionPermissions;
    }>
  > {
    const data = this.getClient().get(
      `${this._getUrlPrefix()}/pending?my_students=${myStudents}`,
      {
        params: {
          'filter[page_num]': pageNum,
        },
      },
    );
    return data;
  }
}
