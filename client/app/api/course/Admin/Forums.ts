import { AxiosResponse } from 'axios';
import type {
  ForumsSettingsData,
  ForumsSettingsPostData,
} from 'types/course/admin/forums';

import BaseAdminAPI from './Base';

export default class ForumsAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/forums`;
  }

  index(): Promise<AxiosResponse<ForumsSettingsData>> {
    return this.getClient().get(this.urlPrefix);
  }

  update(
    data: ForumsSettingsPostData,
  ): Promise<AxiosResponse<ForumsSettingsData>> {
    return this.getClient().patch(this.urlPrefix, data);
  }
}
