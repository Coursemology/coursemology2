import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

import CourseAPI from 'api/course';
import { update } from '../../reducers/notificationSettings';

export const fetchNotificationSettings =
  (action: () => void) =>
  async (dispatch): Promise<void> => {
    const response = await CourseAPI.admin.notifications.index();
    dispatch(update(response.data));
    action();
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
