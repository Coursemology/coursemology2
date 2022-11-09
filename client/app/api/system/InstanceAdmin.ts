import { AxiosResponse } from 'axios';
import {
  AnnouncementListData,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { CourseListData } from 'types/system/courses';
import { ComponentData } from 'types/system/instance/components';
import { InvitationListData } from 'types/system/instance/invitations';
import { RoleRequestListData } from 'types/system/instance/roleRequests';
import {
  InstanceAdminStats,
  InstanceUserListData,
} from 'types/system/instance/users';
import { InstanceBasicListData } from 'types/system/instances';

import BaseSystemAPI from '../Base';

export default class InstanceAdminAPI extends BaseSystemAPI {
  static _getUrlPrefix(): string {
    return `/admin/instance`;
  }

  /**
   * Fetches instance information
   */
  fetchInstance(): Promise<
    AxiosResponse<{
      instance: InstanceBasicListData;
    }>
  > {
    return this.getClient().get(`${InstanceAdminAPI._getUrlPrefix()}`);
  }

  /**
   * Fetches a list of instance announcements.
   */
  indexAnnouncements(): Promise<
    AxiosResponse<{
      announcements: AnnouncementListData[];
      permissions: AnnouncementPermissions;
    }>
  > {
    return this.getClient().get(
      `${InstanceAdminAPI._getUrlPrefix()}/announcements`,
    );
  }

  /**
   * Creates an instance announcement.
   */
  createAnnouncement(params: FormData): Promise<AxiosResponse> {
    return this.getClient().post(
      `${InstanceAdminAPI._getUrlPrefix()}/announcements`,
      params,
    );
  }

  /**
   * Updates an instance announcement.
   */
  updateAnnouncement(
    announcementId: number,
    params: FormData,
  ): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${InstanceAdminAPI._getUrlPrefix()}/announcements/${announcementId}`,
      params,
    );
  }

  /**
   * Deletes an instance announcement.
   */
  deleteAnnouncement(announcementId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${InstanceAdminAPI._getUrlPrefix()}/announcements/${announcementId}`,
    );
  }

  /**
   * Fetches a list of instance users.
   */
  indexUsers(params?: {
    'filter[page_num]'?: number;
    'filter[length]'?: number;
    role?: string;
    active?: string;
    search?: string;
  }): Promise<
    AxiosResponse<{
      users: InstanceUserListData[];
      counts: InstanceAdminStats;
    }>
  > {
    return this.getClient().get(`${InstanceAdminAPI._getUrlPrefix()}/users/`, {
      params,
    });
  }

  /**
   * Updates an instance user.
   */
  updateUser(userId: number, params: FormData): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${InstanceAdminAPI._getUrlPrefix()}/users/${userId}`,
      params,
    );
  }

  /**
   * Deletes an instance user.
   */
  deleteUser(userId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${InstanceAdminAPI._getUrlPrefix()}/users/${userId}`,
    );
  }

  /**
   * Fetches a list of user invitations.
   */
  indexInvitations(): Promise<
    AxiosResponse<{
      invitations: InvitationListData[];
    }>
  > {
    return this.getClient().get(
      `${InstanceAdminAPI._getUrlPrefix()}/user_invitations`,
    );
  }

  /**
   * Deletes an invitation.
   *
   * @param {number} invitationId Invitation to delete
   * @return {Promise}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  deleteInvitation(invitationId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${InstanceAdminAPI._getUrlPrefix()}/user_invitations/${invitationId}`,
    );
  }

  /**
   * Invites users
   *
   * @param {FormData} data Cleaned form data from react-hook-form
   * @return {Promise}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  inviteUsers(data: FormData): Promise<
    AxiosResponse<{
      newInvitations: number;
      invitationResult: string; // string which is JSON.parsed to type InvitationResult
    }>
  > {
    const formData = data as FormData;

    return this.getClient().post(
      `${InstanceAdminAPI._getUrlPrefix()}/users/invite`,
      formData,
    );
  }

  /**
   * Resends an invitation email.
   *
   * @param {number} invitationId Invitation to resend email to
   * @return {Promise} updated invitation
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  resendInvitationEmail(
    invitationId: number,
  ): Promise<AxiosResponse<InvitationListData>> {
    return this.getClient().post(
      `${InstanceAdminAPI._getUrlPrefix()}/user_invitations/${invitationId}/resend_invitation`,
    );
  }

  /**
   * Resends all invitation emails.
   *
   * @return {Promise} updated invitations
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  resendAllInvitations(): Promise<
    AxiosResponse<{ invitations: InvitationListData[] }>
  > {
    return this.getClient().post(
      `${InstanceAdminAPI._getUrlPrefix()}/users/resend_invitations`,
    );
  }

  /**
   * Fetches a list of courses.
   */
  indexCourses(params?: {
    'filter[page_num]'?: number;
    'filter[length]'?: number;
    active?: string;
    search?: string;
  }): Promise<
    AxiosResponse<{
      courses: CourseListData[];
      totalCourses: number;
      activeCourses: number;
      coursesCount: number;
    }>
  > {
    return this.getClient().get(`${InstanceAdminAPI._getUrlPrefix()}/courses`, {
      params,
    });
  }

  /**
   * Deletes a course
   */
  deleteCourse(id: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${InstanceAdminAPI._getUrlPrefix()}/courses/${id}`,
    );
  }

  /**
   * Fetches a list of components.
   */
  indexComponents(): Promise<
    AxiosResponse<{
      components: ComponentData[];
    }>
  > {
    return this.getClient().get(
      `${InstanceAdminAPI._getUrlPrefix()}/components`,
    );
  }

  /**
   * Updates components of an instance.
   */
  updateComponents(params): Promise<
    AxiosResponse<{
      components: ComponentData[];
    }>
  > {
    return this.getClient().patch(
      `${InstanceAdminAPI._getUrlPrefix()}/components`,
      params,
    );
  }

  /**
   * Fetches a list of role requests.
   */
  indexRoleRequests(): Promise<
    AxiosResponse<{
      roleRequests: RoleRequestListData[];
    }>
  > {
    return this.getClient().get('/role_requests');
  }

  /**
   * Creates a role request.
   */
  createRoleRequest(params: FormData): Promise<AxiosResponse<{ id: number }>> {
    return this.getClient().post(`/role_requests`, params);
  }

  /**
   * Updates a role request.
   */
  updateRoleRequest(
    roleRequestId: number,
    params: FormData,
  ): Promise<AxiosResponse<{ id: number }>> {
    return this.getClient().patch(`/role_requests/${roleRequestId}`, params);
  }

  /**
   * Approve an instance user role request
   * success response: RoleRequestListData - Data of the changed instance user
   * error response: { errors: [] } - An array of errors will be returned upon error.
   */
  approveRoleRequest(
    roleRequest: FormData,
    requestId: number,
  ): Promise<AxiosResponse<RoleRequestListData>> {
    return this.getClient().patch(
      `/role_requests/${requestId}/approve`,
      roleRequest,
    );
  }

  /**
   * Reject an instance user role request, with an optional rejection message
   * success response: RoleRequestListData - Data of the changed instance user
   * error response: { errors: [] } - An array of errors will be returned upon error.
   */
  rejectRoleRequest(
    requestId: number,
    message?: string,
  ): Promise<AxiosResponse<RoleRequestListData>> {
    if (message) {
      const params = {
        user_role_request: {
          rejection_message: message,
        },
      };
      return this.getClient().patch(
        `/role_requests/${requestId}/reject`,
        params,
      );
    }
    return this.getClient().patch(`/role_requests/${requestId}/reject`);
  }
}
