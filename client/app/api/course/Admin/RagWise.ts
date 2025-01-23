import { AxiosResponse } from 'axios';
import {
  Folder,
  Material,
  RagWiseSettings,
  RagWiseSettingsPostData,
} from 'types/course/admin/ragWise';

import BaseAdminAPI from './Base';

export default class RagWiseAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/rag_wise`;
  }

  index(): Promise<AxiosResponse<RagWiseSettings>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: RagWiseSettingsPostData,
  ): Promise<AxiosResponse<RagWiseSettings>> {
    return this.client.patch(this.urlPrefix, data);
  }

  materials(): Promise<AxiosResponse<{ materials: Material[] }>> {
    return this.client.get(`${this.urlPrefix}/materials`);
  }

  folders(): Promise<AxiosResponse<{ folders: Folder[] }>> {
    return this.client.get(`${this.urlPrefix}/folders`);
  }
}
