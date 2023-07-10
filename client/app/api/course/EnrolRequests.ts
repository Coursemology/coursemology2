import { AxiosResponse } from 'axios';
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersSharedData,
} from 'types/course/courseUsers';
import {
  ApproveEnrolRequestPatchData,
  EnrolRequestListData,
} from 'types/course/enrolRequests';

import BaseCourseAPI from './Base';

export default class UserInvitationsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/enrol_requests`;
  }

  /**
   * Fetches data from enrol requests index
   */
  index(): Promise<
    AxiosResponse<{
      enrolRequests: EnrolRequestListData[];
      permissions: ManageCourseUsersPermissions;
      manageCourseUsersData: ManageCourseUsersSharedData;
    }>
  > {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Approve a course enrol request
   * success response: EnrolRequestListData - Data of the changed course enrolment
   * error response: { errors: [] } - An array of errors will be returned upon error.
   */
  approve(
    enrolRequest: ApproveEnrolRequestPatchData,
    requestId: number,
  ): Promise<AxiosResponse<EnrolRequestListData>> {
    return this.client.patch(
      `${this.#urlPrefix}/${requestId}/approve`,
      enrolRequest,
    );
  }

  /**
   * Reject a course enrol request
   * success response: EnrolRequestListData - Data of the changed course enrolment
   * error response: { errors: [] } - An array of errors will be returned upon error.
   */
  reject(requestId: number): Promise<AxiosResponse<EnrolRequestListData>> {
    return this.client.patch(`${this.#urlPrefix}/${requestId}/reject`);
  }
}
