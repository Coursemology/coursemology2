import { AxiosResponse } from 'axios';
import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementPermissions,
} from 'types/course/announcements';

import BaseCourseAPI from './Base';

export default class AnnouncementsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.getCourseId()}/announcements`;
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
    return this.getClient().get(this.#urlPrefix);
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
    return this.getClient().post(this.#urlPrefix, params);
  }

  /**
   * Updates an announcement
   */
  update(
    announcementId: number,
    params: FormData | object,
  ): Promise<AxiosResponse<AnnouncementData>> {
    return this.getClient().patch(
      `${this.#urlPrefix}/${announcementId}`,
      params,
    );
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
    return this.getClient().delete(`${this.#urlPrefix}/${announcementId}`);
  }
}
