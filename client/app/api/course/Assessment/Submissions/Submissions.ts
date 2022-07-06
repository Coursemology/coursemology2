import { AxiosResponse } from 'axios';
import BaseCourseAPI from 'api/course/Base';
import {
  SubmissionListData,
  SubmissionPermissions,
  SubmissionFilterData,
  SubmissionsTabData,
} from 'types/course/assessment/submissions';

export default class SubmissionsAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/assessments/submissions`;
  }

  /**
   * Fetches a list of achievements in a course.
   */
  index(): Promise<
    AxiosResponse<{
      isGamified: boolean;
      submissionCount: number;
      submissions: SubmissionListData[];
      tabs: SubmissionsTabData;
      filter: SubmissionFilterData;
      permissions: SubmissionPermissions;
    }>
  > {
    return this.getClient().get(this._getUrlPrefix());
  }

  pending(isMyStudents: boolean): Promise<
    AxiosResponse<{
      isGamified: boolean;
      submissionCount: number;
      submissions: SubmissionListData[];
      tabs: SubmissionsTabData;
      filter: SubmissionFilterData;
      permissions: SubmissionPermissions;
    }>
  > {
    return this.getClient().get(`${this._getUrlPrefix()}/pending`, {
      params: { my_students: isMyStudents },
    });
  }

  category(categoryId: number): Promise<
    AxiosResponse<{
      isGamified: boolean;
      submissionCount: number;
      submissions: SubmissionListData[];
      tabs: SubmissionsTabData;
      filter: SubmissionFilterData;
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
    categoryId: number,
    assessmentId: number | null,
    groupId: number | null,
    userId: number | null,
    pageNum: number | null,
  ): Promise<
    AxiosResponse<{
      isGamified: boolean;
      submissionCount: number;
      submissions: SubmissionListData[];
      tabs: SubmissionsTabData;
      filter: SubmissionFilterData;
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
}
