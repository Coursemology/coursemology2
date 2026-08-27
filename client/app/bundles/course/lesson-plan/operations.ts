import { Operation } from 'store';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';

import { actions } from './store';

export function fetchLessonPlan(): Operation {
  return async (dispatch) => {
    dispatch(actions.loadRequested());
    return CourseAPI.lessonPlan
      .fetch()
      .then((response) => {
        dispatch(actions.loadSucceeded(response.data));
      })
      .catch(() => {
        dispatch(actions.loadFailed());
      });
  };
}

export function createMilestone(
  values,
  successMessage,
  failureMessage,
  setError,
): Operation<boolean> {
  return async (dispatch) => {
    return CourseAPI.lessonPlan
      .createMilestone({ lesson_plan_milestone: values })
      .then((response) => {
        dispatch(actions.milestoneCreated(response.data));
        setNotification(successMessage)(dispatch);
        return true;
      })
      .catch((error) => {
        setNotification(failureMessage)(dispatch);
        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        return false;
      });
  };
}

/**
 * Reports whether the save succeeded and leaves the notification to the caller:
 * a row that has already queued a newer edit suppresses the message so the user
 * gets one verdict, from the last edit, rather than two.
 */
export function updateMilestone(id, values, setError): Operation<boolean> {
  return async (dispatch) => {
    return CourseAPI.lessonPlan
      .updateMilestone(id, { lesson_plan_milestone: values })
      .then((response) => {
        dispatch(actions.milestoneUpdated(response.data));
        return true;
      })
      .catch((error) => {
        if (error?.response?.data?.errors && setError) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        return false;
      });
  };
}

export function deleteMilestone(id, successMessage, failureMessage): Operation {
  return async (dispatch) => {
    return CourseAPI.lessonPlan
      .deleteMilestone(id)
      .then(() => {
        dispatch(actions.milestoneDeleted(id));
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        setNotification(failureMessage)(dispatch);
      });
  };
}

/** See `updateMilestone` for why the notification is the caller's. */
export function updateItem(id, values): Operation<boolean> {
  return async (dispatch) => {
    return CourseAPI.lessonPlan
      .updateItem(id, { item: values })
      .then(() => {
        dispatch(actions.itemUpdated({ id, ...values }));
        return true;
      })
      .catch(() => false);
  };
}

export function createEvent(
  values,
  successMessage,
  failureMessage,
  setError,
): Operation<boolean> {
  return async (dispatch) => {
    return CourseAPI.lessonPlan
      .createEvent({ lesson_plan_event: values })
      .then((response) => {
        dispatch(actions.eventCreated(response.data));
        setNotification(successMessage)(dispatch);
        return true;
      })
      .catch((error) => {
        setNotification(failureMessage)(dispatch);
        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        return false;
      });
  };
}

export function updateEvent(
  eventId,
  values,
  successMessage,
  failureMessage,
  setError,
): Operation<boolean> {
  return async (dispatch) => {
    return CourseAPI.lessonPlan
      .updateEvent(eventId, { lesson_plan_event: values })
      .then((response) => {
        dispatch(actions.eventUpdated(response.data));
        setNotification(successMessage)(dispatch);
        return true;
      })
      .catch((error) => {
        setNotification(failureMessage)(dispatch);
        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        return false;
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
    return CourseAPI.lessonPlan
      .deleteEvent(eventId)
      .then(() => {
        dispatch(actions.eventDeleted(itemId));
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        setNotification(failureMessage)(dispatch);
      });
  };
}
