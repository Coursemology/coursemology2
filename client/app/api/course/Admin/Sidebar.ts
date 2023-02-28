import { AxiosResponse } from 'axios';
import type {
  SidebarItems,
  SidebarItemsPostData,
} from 'types/course/admin/sidebar';

import BaseAdminAPI from './Base';

export default class SidebarAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/sidebar`;
  }

  index(): Promise<AxiosResponse<SidebarItems>> {
    return this.getClient().get(this.urlPrefix);
  }

  update(data: SidebarItemsPostData): Promise<AxiosResponse<SidebarItems>> {
    return this.getClient().patch(this.urlPrefix, data);
  }
}
