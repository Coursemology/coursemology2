import { AxiosResponse } from 'axios';
import type {
  MaterialsSettingsData,
  MaterialsSettingsPostData,
} from 'types/course/admin/materials';

import BaseAdminAPI from './Base';

export default class MaterialsAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/materials`;
  }

  index(): Promise<AxiosResponse<MaterialsSettingsData>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: MaterialsSettingsPostData,
  ): Promise<AxiosResponse<MaterialsSettingsData>> {
    return this.client.patch(this.urlPrefix, data);
  }
}
