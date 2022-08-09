/* eslint class-methods-use-this: "off" */
import { AxiosResponse } from 'axios';
import {
  AnnouncementListData,
  AnnouncementPermissions,
  AnnouncementData,
} from 'types/course/announcements';
import BaseAPI from './Base';

class AnnouncementsAPI extends BaseAPI {
  _getUrlPrefix(): string {
    return `/announcements`;
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
   * Updates an announcement
   */
  update(
    announcementId: number,
    announcementType: string,
    params: FormData | object,
  ): Promise<AxiosResponse<AnnouncementData>> {
    if (announcementType === 'System::Announcement') {
      return this.getClient().patch(
        `/admin${this._getUrlPrefix()}/${announcementId}`,
        params,
      );
    }
    return this.getClient().patch(
      `/admin/instance${this._getUrlPrefix()}/${announcementId}`,
      params,
    );
  }

  /**
   * Deletes an announcement.
   *
   * @param {number} announcementId
   * @param {string} announcementType
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  delete(
    announcementId: number,
    announcementType: string,
  ): Promise<AxiosResponse> {
    if (announcementType === 'System::Announcement') {
      return this.getClient().delete(
        `/admin${this._getUrlPrefix()}/${announcementId}`,
      );
    }
    return this.getClient().delete(
      `/admin/instance${this._getUrlPrefix()}/${announcementId}`,
    );
  }
}

const GlobalAnnouncementsAPI = {
  announcements: new AnnouncementsAPI(),
};

Object.freeze(GlobalAnnouncementsAPI);

export default GlobalAnnouncementsAPI;
