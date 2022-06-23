import { AxiosResponse } from 'axios';
import BaseCourseAPI from './Base';

export default class AnnouncementsAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
    return `/courses/${this.getCourseId()}/announcements`;
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
    return this.getClient().delete(`${this._getUrlPrefix()}/${announcementId}`);
  }
}
