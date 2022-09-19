import { AxiosResponse } from 'axios';

import type { NotificationSettings } from 'types/course/admin/notifications';
import BaseAdminAPI from './Base';

export default class NotificationsSettingsAPI extends BaseAdminAPI {
  override _getUrlPrefix(): string {
    return `${super._getUrlPrefix()}/notifications`;
  }

  index(): Promise<AxiosResponse<NotificationSettings>> {
    return this.getClient().get(this._getUrlPrefix());
  }

  /**
   * Update a notification setting.
   *
   * @param {object} params
   *   - params in the format of
   *     { email_settings: { :component, :course_assessment_category_id, :setting, :phantom, :regular } }
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  update(params): Promise<AxiosResponse<NotificationSettings>> {
    return this.getClient().patch(this._getUrlPrefix(), params);
  }
}
