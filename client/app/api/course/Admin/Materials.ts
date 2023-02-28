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
    return this.getClient().get(this.urlPrefix);
  }

  update(
    data: MaterialsSettingsPostData,
  ): Promise<AxiosResponse<MaterialsSettingsData>> {
    return this.getClient().patch(this.urlPrefix, data);
  }
}
