/* eslint-disable import/no-unresolved, import/extensions, import/no-extraneous-dependencies */
import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/job-helpers';
/* eslint-enable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import actionTypes from '../constants';

const DOWNLOAD_JOB_POLL_INTERVAL = 2000;
const PUBLISH_JOB_POLL_INTERVAL = 500;

export function fetchSubmissions() {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SUBMISSIONS_REQUEST });

    return CourseAPI.assessment.submissions.index()
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.FETCH_SUBMISSIONS_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.FETCH_SUBMISSIONS_FAILURE }));
  };
}

export function publishSubmissions() {
  return (dispatch) => {
    dispatch({ type: actionTypes.PUBLISH_SUBMISSIONS_REQUEST });

    return CourseAPI.assessment.submissions.publishAll()
      .then(response => response.data)
      .then((data) => {
        if (data.redirect_url) {
          pollJob(data.redirect_url, PUBLISH_JOB_POLL_INTERVAL,
            () => {
              dispatch({ type: actionTypes.PUBLISH_SUBMISSIONS_SUCCESS });
              fetchSubmissions()(dispatch);
            },
            () => dispatch({ type: actionTypes.PUBLISH_SUBMISSIONS_FAILURE })
          );
        } else {
          dispatch({ type: actionTypes.PUBLISH_SUBMISSIONS_SUCCESS });
        }
      })
      .catch(() => dispatch({ type: actionTypes.PUBLISH_SUBMISSIONS_FAILURE }));
  };
}

export function downloadSubmissions(type) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DOWNLOAD_SUBMISSIONS_REQUEST });

    return CourseAPI.assessment.submissions.downloadAll(type)
      .then(response => response.data)
      .then((data) => {
        pollJob(data.redirect_url, DOWNLOAD_JOB_POLL_INTERVAL,
          (successData) => {
            window.location.href = successData.redirect_url;
            dispatch({ type: actionTypes.DOWNLOAD_SUBMISSIONS_SUCCESS });
          },
          () => dispatch({ type: actionTypes.DOWNLOAD_SUBMISSIONS_FAILURE })
        );
      })
      .catch(() => dispatch({ type: actionTypes.DOWNLOAD_SUBMISSIONS_FAILURE }));
  };
}
