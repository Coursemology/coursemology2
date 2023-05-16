import { Operation } from 'store';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';

import actionTypes from './constants';
import { actions } from './store';

export function fetchLessonPlan(): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.LOAD_LESSON_PLAN_REQUEST });
    return CourseAPI.lessonPlan
      .fetch()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_LESSON_PLAN_SUCCESS,
          items: response.data.items,
          milestones: response.data.milestones,
          flags: response.data.flags,
          visibilitySettings: response.data.visibilitySettings,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_LESSON_PLAN_FAILURE });
      });
  };
}

export function createMilestone(
  values,
  successMessage,
  failureMessage,
  setError,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.MILESTONE_CREATE_REQUEST });
    return CourseAPI.lessonPlan
      .createMilestone({ lesson_plan_milestone: values })
      .then((response) => {
        dispatch({
          type: actionTypes.MILESTONE_CREATE_SUCCESS,
          milestone: response.data,
        });
        dispatch(actions.hideMilestoneForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.MILESTONE_CREATE_FAILURE });
        setNotification(failureMessage)(dispatch);
        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
}

export function updateMilestone(
  id,
  values,
  successMessage,
  failureMessage,
  setError,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.MILESTONE_UPDATE_REQUEST });
    return CourseAPI.lessonPlan
      .updateMilestone(id, { lesson_plan_milestone: values })
      .then((response) => {
        dispatch({
          type: actionTypes.MILESTONE_UPDATE_SUCCESS,
          milestoneId: id,
          milestone: response.data,
        });
        dispatch(actions.hideMilestoneForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.MILESTONE_UPDATE_FAILURE });
        setNotification(failureMessage)(dispatch);
        if (error?.response?.data?.errors && setError) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
}

export function deleteMilestone(id, successMessage, failureMessage): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.MILESTONE_DELETE_REQUEST });
    return CourseAPI.lessonPlan
      .deleteMilestone(id)
      .then(() => {
        dispatch({
          type: actionTypes.MILESTONE_DELETE_SUCCESS,
          milestoneId: id,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.MILESTONE_DELETE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function updateItem(
  id,
  values,
  successMessage,
  failureMessage,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.ITEM_UPDATE_REQUEST });
    return CourseAPI.lessonPlan
      .updateItem(id, { item: values })
      .then(() => {
        dispatch({
          type: actionTypes.ITEM_UPDATE_SUCCESS,
          item: { id, ...values },
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.ITEM_UPDATE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function createEvent(
  values,
  successMessage,
  failureMessage,
  setError,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.EVENT_CREATE_REQUEST });
    return CourseAPI.lessonPlan
      .createEvent({ lesson_plan_event: values })
      .then((response) => {
        dispatch({
          type: actionTypes.EVENT_CREATE_SUCCESS,
          event: response.data,
        });
        dispatch(actions.hideEventForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.EVENT_CREATE_FAILURE });
        setNotification(failureMessage)(dispatch);
        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
}

export function updateEvent(
  eventId,
  values,
  successMessage,
  failureMessage,
  setError,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.EVENT_UPDATE_REQUEST });
    return CourseAPI.lessonPlan
      .updateEvent(eventId, { lesson_plan_event: values })
      .then((response) => {
        dispatch({
          type: actionTypes.EVENT_UPDATE_SUCCESS,
          eventId,
          event: response.data,
        });
        dispatch(actions.hideEventForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.EVENT_UPDATE_FAILURE });
        setNotification(failureMessage)(dispatch);
        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
}

export function deleteEvent(
  itemId,
  eventId,
  successMessage,
  failureMessage,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.EVENT_DELETE_REQUEST });
    return CourseAPI.lessonPlan
      .deleteEvent(eventId)
      .then(() => {
        dispatch({
          type: actionTypes.EVENT_DELETE_SUCCESS,
          itemId,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.EVENT_DELETE_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
