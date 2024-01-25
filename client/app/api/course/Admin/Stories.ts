import { AxiosResponse } from 'axios';
import type {
  StoriesSettingsData,
  StoriesSettingsPostData,
} from 'types/course/admin/stories';

import BaseAdminAPI from './Base';

export default class StoriesAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/stories`;
  }

  index(): Promise<AxiosResponse<StoriesSettingsData>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: StoriesSettingsPostData,
  ): Promise<AxiosResponse<StoriesSettingsData>> {
    return this.client.patch(this.urlPrefix, data);
  }
}
