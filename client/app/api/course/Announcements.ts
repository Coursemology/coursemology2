import {
  AnnouncementData,
  FetchAnnouncementsData,
} from 'types/course/announcements';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class AnnouncementsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/announcements`;
  }

  /**
   * Fetches all the announcements
   */
  index(): APIResponse<FetchAnnouncementsData> {
    return this.client.get(this.#urlPrefix);
  }

  /**
   * Creates a new announcement
   */
  create(params: FormData): APIResponse<AnnouncementData> {
    return this.client.post(this.#urlPrefix, params);
  }

  /**
   * Updates an announcement
   */
  update(
    announcementId: number,
    params: FormData | object,
  ): APIResponse<AnnouncementData> {
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
  delete(announcementId: number): APIResponse {
    return this.client.delete(`${this.#urlPrefix}/${announcementId}`);
  }
}
