import { AxiosResponse } from 'axios';
import {
  GradebookSettingsData,
  GradebookSettingsPostData,
} from 'types/course/admin/gradebook';

import BaseAdminAPI from './Base';

export default class GradebookAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/gradebook`;
  }

  index(): Promise<AxiosResponse<GradebookSettingsData>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: GradebookSettingsPostData,
  ): Promise<AxiosResponse<GradebookSettingsData>> {
    return this.client.patch(this.urlPrefix, data);
  }
}
