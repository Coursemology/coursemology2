import { AxiosResponse } from 'axios';
import type {
  ScholaisticSettingsData,
  ScholaisticSettingsPostData,
} from 'types/course/admin/scholaistic';

import BaseAdminAPI from './Base';

export default class ScholaisticAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/scholaistic`;
  }

  index(): Promise<AxiosResponse<ScholaisticSettingsData>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: ScholaisticSettingsPostData,
  ): Promise<AxiosResponse<ScholaisticSettingsData>> {
    return this.client.patch(this.urlPrefix, data);
  }
}
