import { AnnouncementListData } from 'types/course/announcements';

import BaseAPI from './Base';
import { APIResponse } from './types';

export default class AnnouncementsAPI extends BaseAPI {
  // eslint-disable-next-line class-methods-use-this
  _getUrlPrefix(): string {
    return `/announcements`;
  }

  /**
   * Fetches all the announcements (admin and instance announcements)
   */
  index(): APIResponse<{
    announcements: AnnouncementListData[];
  }> {
    return this.getClient().get(this._getUrlPrefix());
  }
}
