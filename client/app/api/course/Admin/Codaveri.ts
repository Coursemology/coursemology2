import { AxiosResponse } from 'axios';
import {
  CodaveriSettingsData,
  CodaveriSettingsPostData,
} from 'types/course/admin/codaveri';

import BaseAdminAPI from './Base';

export default class CodaveriAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/codaveri`;
  }

  index(): Promise<AxiosResponse<CodaveriSettingsData>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: CodaveriSettingsPostData,
  ): Promise<AxiosResponse<CodaveriSettingsData>> {
    return this.client.patch(this.urlPrefix, data);
  }
}
