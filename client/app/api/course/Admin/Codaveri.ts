import { AxiosResponse } from 'axios';
import {
  CodaveriSettingsData,
  CodaveriSettingsPostData,
} from 'types/course/admin/codaveri';

import BaseAdminAPI from './Base';

export default class CodaveriAdminAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/codaveri`;
  }

  index(): Promise<AxiosResponse<CodaveriSettingsData>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(
    data: CodaveriSettingsPostData,
  ): Promise<AxiosResponse<CodaveriSettingsData>> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }
}
