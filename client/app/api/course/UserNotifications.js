import BaseCourseAPI from './Base';

export default class UserNotificationsAPI extends BaseCourseAPI {
  fetch() {
    return this.getClient().get(`${this.#urlPrefix}/fetch`);
  }

  markAsRead(userNotificationId) {
    return this.getClient().post(
      `${this.#urlPrefix}/${userNotificationId}/mark_as_read`,
    );
  }

  get #urlPrefix() {
    return `/courses/${this.getCourseId()}/user_notifications`;
  }
}
