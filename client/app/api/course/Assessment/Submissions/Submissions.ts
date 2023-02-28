import { AxiosResponse } from 'axios';
import {
  SubmissionListData,
  SubmissionPermissions,
  SubmissionsMetaData,
} from 'types/course/assessment/submissions';

import BaseCourseAPI from 'api/course/Base';

export default class SubmissionsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/assessments/submissions`;
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
    return this.client.get(this.#urlPrefix);
  }

  pending(isMyStudents: boolean): Promise<
    AxiosResponse<{
      submissions: SubmissionListData[];
      metaData: SubmissionsMetaData;
      permissions: SubmissionPermissions;
    }>
  > {
    return this.client.get(`${this.#urlPrefix}/pending`, {
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
    return this.client.get(this.#urlPrefix, {
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
    return this.client.get(this.#urlPrefix, {
      params: {
        'filter[category_id]': categoryId,
        'filter[assessment_id]': assessmentId,
        'filter[group_id]': groupId,
        'filter[user_id]': userId,
        'filter[page_num]': pageNum,
      },
    });
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
    return this.client.get(
      `${this.#urlPrefix}/pending?my_students=${myStudents}`,
      {
        params: {
          'filter[page_num]': pageNum,
        },
      },
    );
  }
}
