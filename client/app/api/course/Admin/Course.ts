import { AxiosResponse } from 'axios';
import type {
  CourseAdminItems,
  CourseInfo,
  CourseInfoPostData,
  TimeZones,
} from 'types/course/admin/course';

import BaseAdminAPI from './Base';

export default class CourseAdminAPI extends BaseAdminAPI {
  index(): Promise<AxiosResponse<CourseInfo>> {
    return this.client.get(this.urlPrefix);
  }

  timeZones(): Promise<AxiosResponse<TimeZones>> {
    return this.client.get(`${this.urlPrefix}/time_zones`);
  }

  items(): Promise<AxiosResponse<CourseAdminItems>> {
    return this.client.get(`${this.urlPrefix}/items`);
  }

  update(data: CourseInfoPostData): Promise<AxiosResponse<CourseInfo>> {
    return this.client.patch(this.urlPrefix, data);
  }

  updateLogo(image: File): Promise<AxiosResponse<CourseInfo>> {
    const formData = new FormData();
    formData.append('course[logo]', image);
    return this.client.patch(this.urlPrefix, formData);
  }

  delete(): Promise<AxiosResponse> {
    return this.client.delete(this.urlPrefix);
  }
}
