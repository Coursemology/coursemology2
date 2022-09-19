/* eslint class-methods-use-this: "off" */
import { AxiosResponse } from 'axios';
import { AnnouncementListData } from 'types/course/announcements';
import BaseAPI from './Base';

class AnnouncementsAPI extends BaseAPI {
  _getUrlPrefix(): string {
    return `/announcements`;
  }

  /**
   * Fetches all the announcements (admin and instance announcements)
   */
  index(): Promise<
    AxiosResponse<{
      announcements: AnnouncementListData[];
    }>
  > {
    return this.getClient().get(this._getUrlPrefix());
  }
}

const GlobalAnnouncementsAPI = {
  announcements: new AnnouncementsAPI(),
};

Object.freeze(GlobalAnnouncementsAPI);

export default GlobalAnnouncementsAPI;
