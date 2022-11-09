import { AxiosResponse } from 'axios';
import type {
  ForumsSettingsData,
  ForumsSettingsPostData,
} from 'types/course/admin/forums';

import BaseAdminAPI from './Base';

export default class ForumsAdminAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/forums`;
  }

  index(): Promise<AxiosResponse<ForumsSettingsData>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(
    data: ForumsSettingsPostData,
  ): Promise<AxiosResponse<ForumsSettingsData>> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }
}
