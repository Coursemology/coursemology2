import { AxiosResponse } from 'axios';
import { AnnouncementListData } from 'types/system/announcements';
import { CourseListData } from 'types/system/courses';
import { InstanceListData, InstancePermissions } from 'types/system/instances';
import { UserListData, AdminStats } from 'types/users';
import BaseCourseAPI from '../Base';

export default class BaseAdminAPI extends BaseCourseAPI {
  static _getUrlPrefix(): string {
    return `/admin`;
  }

  /**
   * Fetches a list of system announcements.
   */
  indexAnnouncements(): Promise<
    AxiosResponse<{
      announcements: AnnouncementListData[];
    }>
  > {
    return this.getClient().get(
      `${BaseAdminAPI._getUrlPrefix()}/announcements`,
    );
  }

  /**
   * Creates a system announcement.
   */
  createAnnouncement(params: FormData): Promise<AxiosResponse> {
    return this.getClient().post(
      `${BaseAdminAPI._getUrlPrefix()}/announcements`,
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
      `${BaseAdminAPI._getUrlPrefix()}/announcements/${announcementId}`,
      params,
    );
  }

  /**
   * Deletes a system announcement.
   */
  deleteAnnouncement(announcementId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${BaseAdminAPI._getUrlPrefix()}/announcements/${announcementId}`,
    );
  }

  /**
   * Fetches a list of system users.
   */
  indexUsers(): Promise<
    AxiosResponse<{
      users: UserListData[];
      counts: AdminStats;
    }>
  > {
    return this.getClient().get(`${BaseAdminAPI._getUrlPrefix()}/users`);
  }

  /**
   * Updates a system user.
   */
  updateUser(userId: number, params: FormData): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${BaseAdminAPI._getUrlPrefix()}/users/${userId}`,
      params,
    );
  }

  /**
   * Deletes a system user.
   */
  deleteUser(userId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${BaseAdminAPI._getUrlPrefix()}/users/${userId}`,
    );
  }

  /**
   * Fetches a list of instances.
   */
  indexInstances(): Promise<
    AxiosResponse<{
      instances: InstanceListData[];
      permissions: InstancePermissions;
    }>
  > {
    return this.getClient().get(`${BaseAdminAPI._getUrlPrefix()}/instances`);
  }

  /**
   * Creates an instance.
   */
  createInstance(params: FormData): Promise<AxiosResponse> {
    return this.getClient().post(
      `${BaseAdminAPI._getUrlPrefix()}/instances`,
      params,
    );
  }

  /**
   * Updates an instance.
   */
  updateInstance(instanceId: number, params: FormData): Promise<AxiosResponse> {
    return this.getClient().patch(
      `${BaseAdminAPI._getUrlPrefix()}/instances/${instanceId}`,
      params,
    );
  }

  /**
   * Deletes an instance.
   */
  deleteInstance(instanceId: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${BaseAdminAPI._getUrlPrefix()}/instances/${instanceId}`,
    );
  }

  /**
   * Fetches a list of courses.
   */
  indexCourses(): Promise<
    AxiosResponse<{
      courses: CourseListData[];
      totalCourses: number;
      activeCourses: number;
    }>
  > {
    return this.getClient().get(`${BaseAdminAPI._getUrlPrefix()}/courses`);
  }

  /**
   * Deletes a course
   */
  deleteCourse(id: number): Promise<AxiosResponse> {
    return this.getClient().delete(
      `${BaseAdminAPI._getUrlPrefix()}/courses/${id}`,
    );
  }
}
