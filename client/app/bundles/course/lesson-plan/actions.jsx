import CourseAPI from 'api/course';
import { submit, SubmissionError } from 'redux-form';
import { setNotification, resetDeleteConfirmation, showDeleteConfirmation } from 'lib/actions';
import actionTypes, { formNames } from 'course/lesson-plan/constants';

export { setNotification, resetDeleteConfirmation, showDeleteConfirmation };

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
          flags: response.data.flags,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_LESSON_PLAN_FAILURE });
      });
  };
}

export function showMilestoneForm(formParams) {
  return { type: actionTypes.MILESTONE_FORM_SHOW, formParams };
}

export function hideMilestoneForm() {
  return { type: actionTypes.MILESTONE_FORM_HIDE };
}

export function submitMilestoneForm() {
  return (dispatch) => {
    dispatch(submit(formNames.MILESTONE));
  };
}

export function showEventForm(formParams) {
  return { type: actionTypes.EVENT_FORM_SHOW, formParams };
}

export function hideEventForm() {
  return { type: actionTypes.EVENT_FORM_HIDE };
}

export function submitEventForm() {
  return (dispatch) => {
    dispatch(submit(formNames.EVENT));
  };
}

export function createMilestone(values, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.MILESTONE_CREATE_REQUEST });
    return CourseAPI.lessonPlan.createMilestone({ lesson_plan_milestone: values })
      .then((response) => {
        dispatch({
          type: actionTypes.MILESTONE_CREATE_SUCCESS,
          milestone: response.data,
        });
        dispatch(hideMilestoneForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.MILESTONE_CREATE_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function updateMilestone(id, values, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.MILESTONE_UPDATE_REQUEST });
    return CourseAPI.lessonPlan.updateMilestone(id, { lesson_plan_milestone: values })
      .then((response) => {
        dispatch({
          type: actionTypes.MILESTONE_UPDATE_SUCCESS,
          milestoneId: id,
          milestone: response.data,
        });
        dispatch(hideMilestoneForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.MILESTONE_UPDATE_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function deleteMilestone(id, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.MILESTONE_DELETE_REQUEST });
    return CourseAPI.lessonPlan.deleteMilestone(id)
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

export function updateItem(id, values, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.ITEM_UPDATE_REQUEST });
    return CourseAPI.lessonPlan.updateItem(id, { item: values })
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

export function createEvent(values, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.EVENT_CREATE_REQUEST });
    return CourseAPI.lessonPlan.createEvent({ lesson_plan_event: values })
      .then((response) => {
        dispatch({
          type: actionTypes.EVENT_CREATE_SUCCESS,
          event: response.data,
        });
        dispatch(hideEventForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.EVENT_CREATE_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function updateEvent(eventId, values, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.EVENT_UPDATE_REQUEST });
    return CourseAPI.lessonPlan.updateEvent(eventId, { lesson_plan_event: values })
      .then((response) => {
        dispatch({
          type: actionTypes.EVENT_UPDATE_SUCCESS,
          eventId,
          event: response.data,
        });
        dispatch(hideEventForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.EVENT_UPDATE_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function deleteEvent(itemId, eventId, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.EVENT_DELETE_REQUEST });
    return CourseAPI.lessonPlan.deleteEvent(eventId)
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
