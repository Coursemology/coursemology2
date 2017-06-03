import CourseAPI from 'api/course';
import actionTypes from './constants';

export function setNotification(message) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_NOTIFICATION,
      message,
    });
  };
}

export function setItemTypeVisibility(itemType, isVisible) {
  return {
    type: actionTypes.SET_ITEM_TYPE_VISIBILITY,
    itemType,
    isVisible,
  };
}

export function fetchLessonPlan() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_LESSON_PLAN_REQUEST });
    return CourseAPI.lessonPlan.fetch()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_LESSON_PLAN_SUCCESS,
          items: response.data.items,
          milestones: response.data.milestones,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_LESSON_PLAN_FAILURE });
      });
  };
}

export function updateMilestone(id, values, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.MILESTONE_UPDATE_REQUEST });
    return CourseAPI.lessonPlan.updateMilestone(id, { lesson_plan_milestone: values })
      .then(() => {
        dispatch({
          type: actionTypes.MILESTONE_UPDATE_SUCCESS,
          milestoneId: id,
          values,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.MILESTONE_UPDATE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function updateItem(id, values, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.ITEM_UPDATE_REQUEST });
    return CourseAPI.lessonPlan.updateItem(id, { item: values })
      .then(() => {
        dispatch({
          type: actionTypes.ITEM_UPDATE_SUCCESS,
          itemId: id,
          values,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.ITEM_UPDATE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
