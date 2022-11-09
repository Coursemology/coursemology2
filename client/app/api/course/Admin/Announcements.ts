import { AxiosResponse } from 'axios';
import type {
  AnnouncementsSettingsData,
  AnnouncementsSettingsPostData,
} from 'types/course/admin/announcements';

import BaseAdminAPI from './Base';

export default class AnnouncementsAdminAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/announcements`;
  }

  index(): Promise<AxiosResponse<AnnouncementsSettingsData>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(
    data: AnnouncementsSettingsPostData,
  ): Promise<AxiosResponse<AnnouncementsSettingsData>> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }
}
