import { AxiosResponse } from 'axios';

import type {
  SidebarItems,
  SidebarItemsPostData,
} from 'types/course/admin/sidebar';
import BaseAdminAPI from './Base';

export default class SidebarAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/sidebar`;
  }

  index(): Promise<AxiosResponse<SidebarItems>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(data: SidebarItemsPostData): Promise<AxiosResponse<SidebarItems>> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }
}
