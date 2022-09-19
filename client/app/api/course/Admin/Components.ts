import { AxiosResponse } from 'axios';

import type {
  CourseComponents,
  CourseComponentsPostData,
} from 'types/course/admin/components';
import BaseAdminAPI from './Base';

export default class ComponentsAdminAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/components`;
  }

  index(): Promise<AxiosResponse<CourseComponents>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  update(
    data: CourseComponentsPostData,
  ): Promise<AxiosResponse<CourseComponents>> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }
}
