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
  override get urlPrefix(): string {
    return `${super.urlPrefix}/videos`;
  }

  index(): Response {
    return this.client.get(this.urlPrefix);
  }

  update(data: VideosSettingsPostData): Response {
    return this.client.patch(this.urlPrefix, data);
  }

  deleteTab(id: VideosTab['id']): Response {
    return this.client.delete(`${this.urlPrefix}/tabs/${id}`);
  }

  createTab(data: VideosTabPostData): Response {
    return this.client.post(`${this.urlPrefix}/tabs/`, data);
  }
}
