import { AxiosResponse } from 'axios';
import {
  AnnouncementData,
  AnnouncementListData,
  AnnouncementPermissions,
} from 'types/course/announcements';
import BaseCourseAPI from './Base';

export default class AnnouncementsAPI extends BaseCourseAPI {
  _getUrlPrefix(): string {
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
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Creates a new announcement
   */
  create(params: FormData): Promise<AxiosResponse<AnnouncementData>> {
    const data = this.getClient().post(this._getUrlPrefix(), params);
    return data;
  }

  /**
   * Updates an announcement
   */
  update(
    announcementId: number,
    params: FormData | object,
  ): Promise<AxiosResponse<AnnouncementData>> {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/${announcementId}`,
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
    return this.getClient().delete(`${this._getUrlPrefix()}/${announcementId}`);
  }
}
