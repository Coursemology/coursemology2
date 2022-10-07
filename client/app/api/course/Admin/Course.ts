import { AxiosResponse } from 'axios';

import type {
  CourseInfo,
  CourseAdminOptions,
  CourseInfoPostData,
  TimeZones,
} from 'types/course/admin/course';
import BaseAdminAPI from './Base';

export default class CourseAdminAPI extends BaseAdminAPI {
  index(): Promise<AxiosResponse<CourseInfo>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  timeZones(): Promise<AxiosResponse<TimeZones>> {
    return this.getClient().get(`${this._getUrlPrefix()}/time_zones`);
  }

  items(): Promise<AxiosResponse<CourseAdminOptions>> {
    return this.getClient().get(`${this._getUrlPrefix()}/items`);
  }

  update(data: CourseInfoPostData): Promise<AxiosResponse<CourseInfo>> {
    return this.getClient().patch(this._getUrlPrefix(), data);
  }

  updateLogo(image: File): Promise<AxiosResponse<CourseInfo>> {
    const formData = new FormData();
    formData.append('course[logo]', image);
    return this.getClient().patch(this._getUrlPrefix(), formData);
  }

  delete(): Promise<AxiosResponse> {
    return this.getClient().delete(this._getUrlPrefix());
  }
}
