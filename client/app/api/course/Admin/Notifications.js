import BaseAdminAPI from './Base';

export default class NotificationsAPI extends BaseAdminAPI {
  /**
   * Update a notification setting.
   *
   * @param {object} params
   *   - params in the format of { notification_settings: { :component, :key, :enabled, :options } }
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  update(params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/notifications`,
      params
    );
  }
}
