import { submit, SubmissionError } from 'redux-form';
import CourseAPI from 'api/course';
import history from 'lib/history';
import { getCourseId } from 'lib/helpers/url-helpers';
import actionTypes, { formNames } from '../constants';
import { setNotification } from './index';

const formatAttributes = (data) => {
  const payload = new FormData();

  ['title', 'content', 'sticky', 'start_at', 'end_at'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`announcement[${field}]`, data[field]);
    }
  });

  return payload;
};

export function showAnnouncementForm(formParams) {
  return { type: actionTypes.ANNOUNCEMENT_FORM_SHOW, formParams };
}

export function hideAnnouncementForm() {
  return { type: actionTypes.ANNOUNCEMENT_FORM_HIDE };
}

export function submitAnnouncementForm() {
  return (dispatch) => {
    dispatch(submit(formNames.ANNOUNCEMENT));
  };
}

export function createAnnouncement(data, successMessage, failureMessage) {
  const attributes = formatAttributes(data);
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_ANNOUNCEMENT_REQUEST });

    return CourseAPI.announcements.create(attributes)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_ANNOUNCEMENT_SUCCESS,
          announcement: response.data.announcement,
        });
        dispatch({ type: actionTypes.ANNOUNCEMENT_FORM_HIDE });
        setNotification(successMessage)(dispatch);
        const courseId = getCourseId();
        history.push(`/courses/${courseId}/announcements/`);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_ANNOUNCEMENT_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function updateAnnouncement(announcementId, data, successMessage, failureMessage) {
  const attributes = formatAttributes(data);

  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_ANNOUNCEMENT_REQUEST, announcementId });
    return CourseAPI.announcements.update(announcementId, attributes)
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_ANNOUNCEMENT_SUCCESS,
          announcement: response.data.announcement,
        });
        dispatch(hideAnnouncementForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_ANNOUNCEMENT_FAILURE, announcementId });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function deleteAnnouncement(announcementId, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_ANNOUNCEMENT_REQUEST, announcementId });
    return CourseAPI.announcements.delete(announcementId)
      .then(() => {
        history.push(`/courses/${getCourseId()}/announcements/`);
        dispatch({
          announcementId,
          type: actionTypes.DELETE_ANNOUNCEMENT_SUCCESS,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.DELETE_ANNOUNCEMENT_FAILURE, announcementId });
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function fetchAnnouncements() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_ANNOUNCEMENTS_REQUEST });

    return CourseAPI.announcements.index()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_ANNOUNCEMENTS_SUCCESS,
          announcements: response.data.announcements,
          canCreate: response.data.canCreate,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_ANNOUNCEMENTS_FAILURE });
      });
  };
}
