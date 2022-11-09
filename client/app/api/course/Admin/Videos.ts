import { AxiosResponse } from 'axios';
import type {
  VideosSettingsData,
  VideosSettingsPostData,
  VideosTab,
  VideosTabPostData,
} from 'types/course/admin/videos';

import BaseAdminAPI from './Base';

type Response = Promise<AxiosResponse<VideosSettingsData>>;

export default class VideosAdminAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/videos`;
  }

  index(): Response {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(data: VideosSettingsPostData): Response {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }

  deleteTab(id: VideosTab['id']): Response {
    return this.getClient().delete(`${this._getUrlPrefix()}/tabs/${id}`);
  }

  createTab(data: VideosTabPostData): Response {
    return this.getClient().post(`${this._getUrlPrefix()}/tabs/`, data);
  }
}
