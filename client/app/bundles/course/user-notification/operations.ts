import { UserNotificationData } from 'types/course/userNotifications';

import CourseAPI from 'api/course';

export const fetchNotifications = async (): Promise<UserNotificationData> => {
  const response = await CourseAPI.userNotifications.fetch();
  return response.data;
};

export const markAsRead = async (
  notificationId: number,
): Promise<UserNotificationData> => {
  const response = await CourseAPI.userNotifications.markAsRead(notificationId);
  return response.data;
};
