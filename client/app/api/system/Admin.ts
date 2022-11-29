import { AxiosResponse } from 'axios';
import {
  AnnouncementListData,
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
  static _getUrlPrefix(): string {
    return `/admin`;
  }

  /**
   * Fetches a list of system announcements.
   */
  indexAnnouncements(): Promise<
    AxiosResponse<{
      announcements: AnnouncementListData[];
      permissions: AnnouncementPermissions;
    }>
  > {
    return this.getClient().get(`${AdminAPI._getUrlPrefix()}/announcements`);
  }

  /**
   * Creates a system announcement.
   */
  createAnnouncement(params: FormData): Promise<AxiosResponse> {
    return this.getClient().post(
      `${AdminAPI._getUrlPrefix()}/announcements`,
      params,
    );
  }

  /**
   * Updates a system announcement.
   */
  updateAnnouncement(
    announcementId: number,
    params: FormData,
  ): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${AdminAPI._getUrlPrefix()}/announcements/${announcementId}`,
      params,
    );
  }

  /**
   * Deletes a system announcement.
   */
  deleteAnnouncement(announcementId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${AdminAPI._getUrlPrefix()}/announcements/${announcementId}`,
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
    return this.getClient().get(`${AdminAPI._getUrlPrefix()}/users/`, {
      params,
    });
  }

  /**
   * Updates a system user.
   */
  updateUser(userId: number, params: FormData): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${AdminAPI._getUrlPrefix()}/users/${userId}`,
      params,
    );
  }

  /**
   * Deletes a system user.
   */
  deleteUser(userId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${AdminAPI._getUrlPrefix()}/users/${userId}`,
    );
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
    return this.getClient().get(`${AdminAPI._getUrlPrefix()}/instances`);
  }

  /**
   * Creates an instance.
   */
  createInstance(params: FormData): Promise<AxiosResponse> {
    return this.getClient().post(
      `${AdminAPI._getUrlPrefix()}/instances`,
      params,
    );
  }

  /**
   * Updates an instance.
   */
  updateInstance(instanceId: number, params: FormData): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${AdminAPI._getUrlPrefix()}/instances/${instanceId}`,
      params,
    );
  }

  /**
   * Deletes an instance.
   */
  deleteInstance(instanceId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${AdminAPI._getUrlPrefix()}/instances/${instanceId}`,
    );
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
    return this.getClient().get(`${AdminAPI._getUrlPrefix()}/courses`, {
      params,
    });
  }

  /**
   * Deletes a course
   */
  deleteCourse(id: number): Promise<AxiosResponse> {
    return this.getClient().delete(`${AdminAPI._getUrlPrefix()}/courses/${id}`);
  }
}
