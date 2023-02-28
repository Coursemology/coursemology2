import { AxiosResponse } from 'axios';
import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementPermissions,
} from 'types/course/announcements';

import BaseCourseAPI from './Base';

export default class AnnouncementsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/announcements`;
  }

  /**
   * Fetches all the announcements
   */
  index(): Promise<
    AxiosResponse<{
      announcements: AnnouncementListData[];
      permissions: AnnouncementPermissions;
    }>
  > {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Creates a new announcement
   */
  create(params: FormData): Promise<
    AxiosResponse<{
      announcements: AnnouncementListData[];
      permissions: AnnouncementPermissions;
    }>
  > {
    return this.client.post(this.#urlPrefix, params);
  }

  /**
   * Updates an announcement
   */
  update(
    announcementId: number,
    params: FormData | object,
  ): Promise<AxiosResponse<AnnouncementData>> {
    return this.client.patch(`${this.#urlPrefix}/${announcementId}`, params);
  }

  /**
   * Deletes an announcement.
   *
   * @param {number} announcementId
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  delete(announcementId: number): Promise<AxiosResponse> {
    return this.client.delete(`${this.#urlPrefix}/${announcementId}`);
  }
}
