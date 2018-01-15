import BaseCourseAPI from './Base';

export default class UserNotificationsAPI extends BaseCourseAPI {
  markAsRead(userNotificationId) {
    return this.getClient().post(`${this._getUrlPrefix()}/${userNotificationId}/mark_as_read`);
  }

  _getUrlPrefix() {
    return `/courses/${this.getCourseId()}/user_notifications`;
  }
}
