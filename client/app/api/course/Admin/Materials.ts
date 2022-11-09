import { AxiosResponse } from 'axios';
import type {
  MaterialsSettingsData,
  MaterialsSettingsPostData,
} from 'types/course/admin/materials';

import BaseAdminAPI from './Base';

export default class MaterialsAdminAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/materials`;
  }

  index(): Promise<AxiosResponse<MaterialsSettingsData>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(
    data: MaterialsSettingsPostData,
  ): Promise<AxiosResponse<MaterialsSettingsData>> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }
}
