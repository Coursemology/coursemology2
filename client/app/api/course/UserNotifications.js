import BaseCourseAPI from './Base';

export default class UserNotificationsAPI extends BaseCourseAPI {
  fetch() {
    return this.client.get(`${this.#urlPrefix}/fetch`);
  }

  markAsRead(userNotificationId) {
    return this.client.post(
      `${this.#urlPrefix}/${userNotificationId}/mark_as_read`,
    );
  }

  get #urlPrefix() {
    return `/courses/${this.getCourseId()}/user_notifications`;
  }
}
