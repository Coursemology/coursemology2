import { UserNotificationData } from 'types/course/userNotifications';

import { APIResponse } from 'api/types';

import BaseCourseAPI from './Base';

export default class UserNotificationsAPI extends BaseCourseAPI {
  get #urlPrefix(): string {
    return `/courses/${this.courseId}/user_notifications`;
  }

  fetch(): APIResponse<UserNotificationData | null> {
    return this.client.get(`${this.#urlPrefix}/fetch`);
  }

  markAsRead(notificationId: number): APIResponse<UserNotificationData> {
    return this.client.post(
      `${this.#urlPrefix}/${notificationId}/mark_as_read`,
    );
  }
}
