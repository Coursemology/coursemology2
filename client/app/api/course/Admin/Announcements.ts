import { AxiosResponse } from 'axios';
import type {
  AnnouncementsSettingsData,
  AnnouncementsSettingsPostData,
} from 'types/course/admin/announcements';

import BaseAdminAPI from './Base';

export default class AnnouncementsAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/announcements`;
  }

  index(): Promise<AxiosResponse<AnnouncementsSettingsData>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: AnnouncementsSettingsPostData,
  ): Promise<AxiosResponse<AnnouncementsSettingsData>> {
    return this.client.patch(this.urlPrefix, data);
  }
}
