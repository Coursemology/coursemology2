import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';

import { update } from '../../reducers/notificationSettings';

export const fetchNotificationSettings =
  (action: () => void, failureMessage) =>
  async (dispatch): Promise<void> => {
    try {
      const response = await CourseAPI.admin.notifications.index();
      dispatch(update(response.data));
      action();
    } catch (error) {
      if (error instanceof AxiosError) toast.error(failureMessage);
      action();
    }
  };

export const updateNotificationSettings =
  (payload, successMessage, failureMessage) =>
  async (dispatch): Promise<void> => {
    try {
      const response = await CourseAPI.admin.notifications.update(payload);
      dispatch(update(response.data));
      toast.success(successMessage);
    } catch (error) {
      if (error instanceof AxiosError) toast.error(failureMessage);
    }
  };
