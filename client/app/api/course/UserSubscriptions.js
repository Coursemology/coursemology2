import BaseCourseAPI from './Base';

export default class UserSubscriptionsAPI extends BaseCourseAPI {
  /**
   * Fetches all email subscription settings for a course user.
   *
   * @return {Promise}
   */
  fetch() {
    return this.getClient().get(
      `${this._getUrlPrefix()}/manage_email_subscription`,
    );
  }

  /**
   * Update an email subscription setting for a user.
   *
   * @param {object} params
   *   - params in the format of
   *     { user_subscriptions: { :component, :course_assessment_category_id, :setting, :enabled  }
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  update(params) {
    return this.getClient().patch(
      `${this._getUrlPrefix()}/manage_email_subscription`,
      params,
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/users/${this.getCourseUserId()}`;
  }
}
