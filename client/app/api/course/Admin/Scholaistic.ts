import type {
  ScholaisticSettingsData,
  ScholaisticSettingsPostData,
} from 'types/course/admin/scholaistic';

import { APIResponse, JustRedirect } from 'api/types';

import BaseAdminAPI from './Base';

export default class ScholaisticAdminAPI extends BaseAdminAPI {
  override get urlPrefix(): string {
    return `${super.urlPrefix}/scholaistic`;
  }

  index(): APIResponse<ScholaisticSettingsData> {
    return this.client.get(this.urlPrefix);
  }

  update(
    data: ScholaisticSettingsPostData,
  ): APIResponse<ScholaisticSettingsData> {
    return this.client.patch(this.urlPrefix, data);
  }

  getLinkScholaisticCourseUrl(): APIResponse<JustRedirect> {
    return this.client.get(`${this.urlPrefix}/link_course`);
  }

  unlinkScholaisticCourse(): APIResponse<void> {
    return this.client.post(`${this.urlPrefix}/unlink_course`);
  }
}
