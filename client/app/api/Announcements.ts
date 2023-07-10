import { AnnouncementData } from 'types/course/announcements';

import BaseAPI from './Base';
import { APIResponse } from './types';

export default class AnnouncementsAPI extends BaseAPI {
  #urlPrefix: string = '/announcements';

  /**
   * Fetches all the announcements (admin and instance announcements)
   */
  index(unread = false): APIResponse<{
    announcements: AnnouncementData[];
  }> {
    return this.client.get(this.#urlPrefix, { params: { unread } });
  }

  markAsRead(url: string): APIResponse {
    return this.client.post(url);
  }
}
