import { AxiosResponse } from 'axios';
import {
  AnnouncementData,
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
  static get #urlPrefix(): string {
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
    return this.client.get(`${InstanceAdminAPI.#urlPrefix}`);
  }

  /**
   * Fetches a list of instance announcements.
   */
  indexAnnouncements(): Promise<
    AxiosResponse<{
      announcements: AnnouncementData[];
      permissions: AnnouncementPermissions;
    }>
  > {
    return this.client.get(`${InstanceAdminAPI.#urlPrefix}/announcements`);
  }

  /**
   * Creates an instance announcement.
   */
  createAnnouncement(params: FormData): Promise<AxiosResponse> {
    return this.client.post(
      `${InstanceAdminAPI.#urlPrefix}/announcements`,
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
    return this.client.patch(
      `${InstanceAdminAPI.#urlPrefix}/announcements/${announcementId}`,
      params,
    );
  }

  /**
   * Deletes an instance announcement.
   */
  deleteAnnouncement(announcementId: number): Promise<AxiosResponse> {
    return this.client.delete(
      `${InstanceAdminAPI.#urlPrefix}/announcements/${announcementId}`,
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
    return this.client.get(`${InstanceAdminAPI.#urlPrefix}/users/`, {
      params,
    });
  }

  /**
   * Updates an instance user.
   */
  updateUser(userId: number, params: FormData): Promise<AxiosResponse> {
    return this.client.patch(
      `${InstanceAdminAPI.#urlPrefix}/users/${userId}`,
      params,
    );
  }

  /**
   * Deletes an instance user.
   */
  deleteUser(userId: number): Promise<AxiosResponse> {
    return this.client.delete(`${InstanceAdminAPI.#urlPrefix}/users/${userId}`);
  }

  /**
   * Fetches a list of user invitations.
   */
  indexInvitations(): Promise<
    AxiosResponse<{
      invitations: InvitationListData[];
    }>
  > {
    return this.client.get(`${InstanceAdminAPI.#urlPrefix}/user_invitations`);
  }

  /**
   * Deletes an invitation.
   *
   * @param {number} invitationId Invitation to delete
   * @return {Promise}
   * error response: { errors: [] } - An array of errors will be returned upon validation error.
   */
  deleteInvitation(invitationId: number): Promise<AxiosResponse> {
    return this.client.delete(
      `${InstanceAdminAPI.#urlPrefix}/user_invitations/${invitationId}`,
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

    return this.client.post(
      `${InstanceAdminAPI.#urlPrefix}/users/invite`,
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
    return this.client.post(
      `${InstanceAdminAPI.#urlPrefix}/user_invitations/${invitationId}/resend_invitation`,
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
    return this.client.post(
      `${InstanceAdminAPI.#urlPrefix}/users/resend_invitations`,
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
    return this.client.get(`${InstanceAdminAPI.#urlPrefix}/courses`, {
      params,
    });
  }

  /**
   * Deletes a course
   */
  deleteCourse(id: number): Promise<AxiosResponse> {
    return this.client.delete(`${InstanceAdminAPI.#urlPrefix}/courses/${id}`);
  }

  /**
   * Fetches a list of components.
   */
  indexComponents(): Promise<
    AxiosResponse<{
      components: ComponentData[];
    }>
  > {
    return this.client.get(`${InstanceAdminAPI.#urlPrefix}/components`);
  }

  /**
   * Updates components of an instance.
   */
  updateComponents(params): Promise<
    AxiosResponse<{
      components: ComponentData[];
    }>
  > {
    return this.client.patch(
      `${InstanceAdminAPI.#urlPrefix}/components`,
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
    return this.client.get('/role_requests');
  }

  /**
   * Creates a role request.
   */
  createRoleRequest(params: FormData): Promise<AxiosResponse<{ id: number }>> {
    return this.client.post('/role_requests', params);
  }

  /**
   * Updates a role request.
   */
  updateRoleRequest(
    roleRequestId: number,
    params: FormData,
  ): Promise<AxiosResponse<{ id: number }>> {
    return this.client.patch(`/role_requests/${roleRequestId}`, params);
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
    return this.client.patch(
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
      return this.client.patch(`/role_requests/${requestId}/reject`, params);
    }
    return this.client.patch(`/role_requests/${requestId}/reject`);
  }
}
