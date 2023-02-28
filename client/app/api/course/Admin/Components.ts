import { AxiosResponse } from 'axios';
import type {
  CourseComponents,
  CourseComponentsPostData,
} from 'types/course/admin/components';

import BaseAdminAPI from './Base';

export default class ComponentsAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/components`;
  }

  index(): Promise<AxiosResponse<CourseComponents>> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: CourseComponentsPostData,
  ): Promise<AxiosResponse<CourseComponents>> {
    return this.client.patch(this.urlPrefix, data);
  }
}
