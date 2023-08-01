import { AxiosError } from 'axios';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';

import { update } from '../../reducers/lessonPlanSettings';

export const fetchLessonPlanSettings =
  (action: () => void, failureMessage) =>
  async (dispatch): Promise<void> => {
    try {
      const response = await CourseAPI.admin.lessonPlan.index();
      dispatch(update(response.data));
      action();
    } catch (error) {
      if (error instanceof AxiosError) toast.error(failureMessage);
      action();
    }
  };

export const updateLessonPlanSettings =
  (value, successMessage, failureMessage) =>
  async (dispatch): Promise<void> => {
    const payload = { lesson_plan_settings: value };

    try {
      const response = await CourseAPI.admin.lessonPlan.update(payload);
      dispatch(update(response.data));
      toast.success(successMessage);
    } catch (error) {
      if (error instanceof AxiosError) toast.error(failureMessage);
    }
  };
