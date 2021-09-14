import BaseCourseAPI from './Base';

export default class UserNotificationsAPI extends BaseCourseAPI {
  fetch() {
    return this.getClient().get(`${this._getUrlPrefix()}/fetch`);
  }

  markAsRead(userNotificationId) {
    return this.getClient().post(
      `${this._getUrlPrefix()}/${userNotificationId}/mark_as_read`
    );
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/user_notifications`;
  }
}
