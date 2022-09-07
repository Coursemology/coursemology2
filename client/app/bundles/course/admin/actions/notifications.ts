import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

import CourseAPI from 'api/course';
import { update } from '../reducers/notificationSettings';

const updateNotificationSettings =
  (payload, successMessage, failureMessage) => async (dispatch) => {
    try {
      const response = await CourseAPI.admin.notifications.update(payload);
      dispatch(update(response.data));
      toast.success(successMessage);
    } catch (error) {
      if (error instanceof AxiosError) toast.error(failureMessage);
    }
  };

export default updateNotificationSettings;
