import BaseAdminAPI from './Base';

export default class NotificationsAPI extends BaseAdminAPI {
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
  update(params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/notifications`,
      params,
    );
  }
}
