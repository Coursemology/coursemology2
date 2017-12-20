/* eslint-disable import/prefer-default-export */
import CourseAPI from 'api/course';
import actionTypes from '../constants';
import { setNotification } from './index';

export function updateLessonPlanItemSetting(value, successMessage, failureMessage) {
  const payload = { lesson_plan_settings: { lesson_plan_item_settings: value } };
  return (dispatch) => {
    dispatch({ type: actionTypes.LESSON_PLAN_ITEM_SETTING_UPDATE_REQUEST });
    return CourseAPI.admin.lessonPlan.update(payload)
      .then((response) => {
        dispatch({
          type: actionTypes.LESSON_PLAN_ITEM_SETTING_UPDATE_SUCCESS,
          updatedSettings: response.data,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.LESSON_PLAN_ITEM_SETTING_UPDATE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
