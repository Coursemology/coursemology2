import CourseAPI from 'api/course';
import history from 'lib/history';
import { getCourseId } from 'lib/helpers/url-helpers';
import actionTypes from '../constants';
import { setNotification } from './index';

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

export function fetchAnnouncements(page) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_ANNOUNCEMENTS_REQUEST });

    return CourseAPI.announcements.index(page)
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_ANNOUNCEMENTS_SUCCESS,
          announcements: response.data.announcements,
          canCreate: response.data.canCreate,
          totalPageCount: response.data.totalPageCount,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_ANNOUNCEMENTS_FAILURE });
      });
  };
}
