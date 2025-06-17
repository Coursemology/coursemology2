import { AxiosResponse } from 'axios';
import {
  AnnouncementData,
  AnnouncementPermissions,
} from 'types/course/announcements';
import { CourseListData } from 'types/system/courses';
import { InstanceListData, InstancePermissions } from 'types/system/instances';
import { AdminStats, UserListData } from 'types/users';

import BaseSystemAPI from '../Base';

interface FilterParams {
  'filter[page_num]'?: number;
  'filter[length]'?: number;
  role?: string;
  active?: string;
  search?: string;
}

export default class AdminAPI extends BaseSystemAPI {
  static get #urlPrefix(): string {
    return `/admin`;
  }

  /**
   * Fetches a list of system announcements.
   */
  indexAnnouncements(): Promise<
    AxiosResponse<{
      announcements: AnnouncementData[];
      permissions: AnnouncementPermissions;
    }>
  > {
    return this.client.get(`${AdminAPI.#urlPrefix}/announcements`);
  }

  /**
   * Creates a system announcement.
   */
  createAnnouncement(params: FormData): Promise<AxiosResponse> {
    return this.client.post(`${AdminAPI.#urlPrefix}/announcements`, params);
  }

  /**
   * Updates a system announcement.
   */
  updateAnnouncement(
    announcementId: number,
    params: FormData,
  ): Promise<AxiosResponse> {
    return this.client.patch(
      `${AdminAPI.#urlPrefix}/announcements/${announcementId}`,
      params,
    );
  }

  /**
   * Deletes a system announcement.
   */
  deleteAnnouncement(announcementId: number): Promise<AxiosResponse> {
    return this.client.delete(
      `${AdminAPI.#urlPrefix}/announcements/${announcementId}`,
    );
  }

  /**
   * Fetches a list of system users.
   */
  indexUsers(params?: FilterParams): Promise<
    AxiosResponse<{
      users: UserListData[];
      counts: AdminStats;
    }>
  > {
    return this.client.get(`${AdminAPI.#urlPrefix}/users/`, {
      params,
    });
  }

  /**
   * Updates a system user.
   */
  updateUser(userId: number, params: FormData): Promise<AxiosResponse> {
    return this.client.patch(`${AdminAPI.#urlPrefix}/users/${userId}`, params);
  }

  /**
   * Deletes a system user.
   */
  deleteUser(userId: number): Promise<AxiosResponse> {
    return this.client.delete(`${AdminAPI.#urlPrefix}/users/${userId}`);
  }

  /**
   * Fetches a list of instances.
   */
  indexInstances(): Promise<
    AxiosResponse<{
      instances: InstanceListData[];
      permissions: InstancePermissions;
      counts: number;
    }>
  > {
    return this.client.get(`${AdminAPI.#urlPrefix}/instances`);
  }

  /**
   * Creates an instance.
   */
  createInstance(params: FormData): Promise<AxiosResponse> {
    return this.client.post(`${AdminAPI.#urlPrefix}/instances`, params);
  }

  /**
   * Updates an instance.
   */
  updateInstance(instanceId: number, params: FormData): Promise<AxiosResponse> {
    return this.client.patch(
      `${AdminAPI.#urlPrefix}/instances/${instanceId}`,
      params,
    );
  }

  /**
   * Deletes an instance.
   */
  deleteInstance(instanceId: number): Promise<AxiosResponse> {
    return this.client.delete(`${AdminAPI.#urlPrefix}/instances/${instanceId}`);
  }

  /**
   * Fetches a list of courses.
   */
  indexCourses(params?: FilterParams): Promise<
    AxiosResponse<{
      courses: CourseListData[];
      totalCourses: number;
      activeCourses: number;
      coursesCount: number;
    }>
  > {
    return this.client.get(`${AdminAPI.#urlPrefix}/courses`, {
      params,
    });
  }

  /**
   * Deletes a course
   */
  deleteCourse(id: number): Promise<AxiosResponse> {
    return this.client.delete(`${AdminAPI.#urlPrefix}/courses/${id}`);
  }

  /**
   * Fetches Get Help data for the system
   */
  fetchSystemGetHelpActivity(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AxiosResponse> {
    return this.client.get(`${AdminAPI.#urlPrefix}/get_help`, {
      params,
    });
  }
}
