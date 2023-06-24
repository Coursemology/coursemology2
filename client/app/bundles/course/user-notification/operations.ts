import { AxiosError } from 'axios';
import { UserNotificationData } from 'types/course/userNotifications';

import CourseAPI from 'api/course';

/**
 * Fetches the current user's notifications in the course, if available.
 *
 * If the current user is not a course user, the network request will fail with
 * status code 403. In this case, `undefined` will be returned and no errors will
 * be thrown.
 */
export const fetchNotifications = async (): Promise<
  UserNotificationData | undefined
> => {
  try {
    const response = await CourseAPI.userNotifications.fetch();
    return response.data;
  } catch (error) {
    if (!(error instanceof AxiosError && error.response?.status === 403))
      throw error;

    return undefined;
  }
};

export const markAsRead = async (
  notificationId: number,
): Promise<UserNotificationData> => {
  const response = await CourseAPI.userNotifications.markAsRead(notificationId);
  return response.data;
};
