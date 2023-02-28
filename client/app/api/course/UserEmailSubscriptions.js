import BaseCourseAPI from './Base';

export default class UserEmailSubscriptionsAPI extends BaseCourseAPI {
  /**
   * Fetches all email subscription settings for a course user.
   *
   * @return {Promise}
   */
  fetch(params) {
    return this.client.get(`${this.#urlPrefix}/manage_email_subscription`, {
      params,
    });
  }

  /**
   * Update an email subscription setting for a user.
   *
   * @param {object} params
   *   - params in the format of
   *     { user_email_subscriptions: { :component, :course_assessment_category_id, :setting, :enabled  }
   * @return {Promise}
   * success response: {}
   * error response: {}
   */
  update(params) {
    return this.client.patch(
      `${this.#urlPrefix}/manage_email_subscription`,
      params,
    );
  }

  get #urlPrefix() {
    return `/courses/${this.courseId}/users/${this.courseUserId}`;
  }
}
