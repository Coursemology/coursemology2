import CourseAPI from 'api/course';
import pollJob from 'lib/helpers/job-helpers';

import actionTypes from '../constants';
import translations from '../translations';

import { setNotification } from './index';

const DOWNLOAD_JOB_POLL_INTERVAL = 2000;
const PUBLISH_JOB_POLL_INTERVAL = 1000;
const FORCE_SUBMIT_JOB_POLL_INTERVAL = 1000;
const UNSUBMIT_ALL_SUBMISSIONS_JOB_POLL_INTERVAL = 1000;
const DELETE_ALL_SUBMISSIONS_JOB_POLL_INTERVAL = 1000;
const DOWNLOAD_STATISTICS_JOB_POLL_INTERVAL = 2000;

export function fetchSubmissions() {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SUBMISSIONS_REQUEST });

    return CourseAPI.assessment.submissions
      .index()
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.FETCH_SUBMISSIONS_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.FETCH_SUBMISSIONS_FAILURE }));
  };
}

export function publishSubmissions(type) {
  return (dispatch) => {
    dispatch({ type: actionTypes.PUBLISH_SUBMISSIONS_REQUEST });

    const handleSuccess = () => {
      dispatch({ type: actionTypes.PUBLISH_SUBMISSIONS_SUCCESS });
      dispatch(setNotification(translations.publishSuccess));
      fetchSubmissions()(dispatch);
    };

    const handleFailure = () => {
      dispatch({ type: actionTypes.PUBLISH_SUBMISSIONS_FAILURE });
      dispatch(setNotification(translations.requestFailure));
    };

    return CourseAPI.assessment.submissions
      .publishAll(type)
      .then((response) => response.data)
      .then((data) => {
        if (data.redirect_url) {
          dispatch(setNotification(translations.publishJobPending));
          pollJob(
            data.redirect_url,
            PUBLISH_JOB_POLL_INTERVAL,
            handleSuccess,
            handleFailure,
          );
        } else {
          handleSuccess();
        }
      })
      .catch(handleFailure);
  };
}

export function forceSubmitSubmissions(type) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FORCE_SUBMIT_SUBMISSIONS_REQUEST });

    const handleSuccess = () => {
      dispatch({ type: actionTypes.FORCE_SUBMIT_SUBMISSIONS_SUCCESS });
      dispatch(setNotification(translations.forceSubmitSuccess));
      fetchSubmissions()(dispatch);
    };

    const handleFailure = () => {
      dispatch({ type: actionTypes.FORCE_SUBMIT_SUBMISSIONS_FAILURE });
      dispatch(setNotification(translations.requestFailure));
    };

    return CourseAPI.assessment.submissions
      .forceSubmitAll(type)
      .then((response) => response.data)
      .then((data) => {
        dispatch(setNotification(translations.forceSubmitJobPending));
        if (data.redirect_url) {
          pollJob(
            data.redirect_url,
            FORCE_SUBMIT_JOB_POLL_INTERVAL,
            handleSuccess,
            handleFailure,
          );
        } else {
          handleSuccess();
        }
      })
      .catch(handleFailure);
  };
}

export function sendAssessmentReminderEmail(assessmentId, type) {
  return (dispatch) => {
    dispatch({ type: actionTypes.SEND_ASSESSMENT_REMINDER_REQUEST });
    return CourseAPI.assessment.assessments
      .remind(assessmentId, type)
      .then(() => {
        dispatch({ type: actionTypes.SEND_ASSESSMENT_REMINDER_SUCCESS });
        dispatch(setNotification(translations.sendReminderEmailSuccess));
      })
      .catch(() => {
        dispatch({ type: actionTypes.SEND_ASSESSMENT_REMINDER_FAILURE });
        dispatch(setNotification(translations.requestFailure));
      });
  };
}

/**
 * Download submissions for indicated user types in a given format (zip or csv)
 *
 * @param {String} [type] user types to be included in the downloaded submissions. Possible value includes:
 *  ['my_students'|'my_students_w_phantom'|'students'|'students_w_phantom'|'staff'|'staff_w_phantom']
 * @param {String} [downloadFormat=zip|csv] submission download format
 * @returns {function(*)} The thunk to download submissions
 */
export function downloadSubmissions(type, downloadFormat) {
  const actions =
    downloadFormat === 'zip'
      ? {
          request: actionTypes.DOWNLOAD_SUBMISSIONS_FILES_REQUEST,
          success: actionTypes.DOWNLOAD_SUBMISSIONS_FILES_SUCCESS,
          failure: actionTypes.DOWNLOAD_SUBMISSIONS_FILES_FAILURE,
        }
      : {
          request: actionTypes.DOWNLOAD_SUBMISSIONS_CSV_REQUEST,
          success: actionTypes.DOWNLOAD_SUBMISSIONS_CSV_SUCCESS,
          failure: actionTypes.DOWNLOAD_SUBMISSIONS_CSV_FAILURE,
        };
  return (dispatch) => {
    dispatch({ type: actions.request });

    const handleSuccess = (successData) => {
      window.location.href = successData.redirect_url;
      dispatch({ type: actions.success });
      dispatch(setNotification(translations.downloadRequestSuccess));
    };

    const handleFailure = () => {
      dispatch({ type: actions.failure });
      dispatch(setNotification(translations.requestFailure));
    };

    return CourseAPI.assessment.submissions
      .downloadAll(type, downloadFormat)
      .then((response) => response.data)
      .then((data) => {
        dispatch(setNotification(translations.downloadSubmissionsJobPending));
        pollJob(
          data.redirect_url,
          DOWNLOAD_JOB_POLL_INTERVAL,
          handleSuccess,
          handleFailure,
        );
      })
      .catch(handleFailure);
  };
}

export function downloadStatistics(type) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DOWNLOAD_STATISTICS_REQUEST });

    const handleSuccess = (successData) => {
      window.location.href = successData.redirect_url;
      dispatch({ type: actionTypes.DOWNLOAD_STATISTICS_SUCCESS });
      dispatch(setNotification(translations.downloadRequestSuccess));
    };

    const handleFailure = (data) => {
      const message =
        (data &&
          data.response &&
          data.response.data &&
          data.response.data.error) ||
        translations.requestFailure;
      dispatch({ type: actionTypes.DOWNLOAD_STATISTICS_FAILURE });
      dispatch(setNotification(message));
    };

    return CourseAPI.assessment.submissions
      .downloadStatistics(type)
      .then((response) => response.data)
      .then((data) => {
        dispatch(setNotification(translations.downloadStatisticsJobPending));
        pollJob(
          data.redirect_url,
          DOWNLOAD_STATISTICS_JOB_POLL_INTERVAL,
          handleSuccess,
          handleFailure,
        );
      })
      .catch(handleFailure);
  };
}

export function unsubmitSubmission(submissionId, successMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UNSUBMIT_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions
      .unsubmitSubmission(submissionId)
      .then(() => {
        dispatch({
          type: actionTypes.UNSUBMIT_SUBMISSION_SUCCESS,
        });
        fetchSubmissions()(dispatch);
        dispatch(setNotification(successMessage));
      })
      .catch(() => {
        dispatch({
          type: actionTypes.UNSUBMIT_SUBMISSION_FAILURE,
        });
        dispatch(setNotification(translations.requestFailure));
      });
  };
}

export function unsubmitAllSubmissions(type) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UNSUBMIT_ALL_SUBMISSIONS_REQUEST });

    const handleSuccess = () => {
      dispatch({ type: actionTypes.UNSUBMIT_ALL_SUBMISSIONS_SUCCESS });
      dispatch(setNotification(translations.unsubmitAllSubmissionsSuccess));
      fetchSubmissions()(dispatch);
    };

    const handleFailure = () => {
      dispatch({ type: actionTypes.UNSUBMIT_ALL_SUBMISSIONS_FAILURE });
      dispatch(setNotification(translations.requestFailure));
    };

    return CourseAPI.assessment.submissions
      .unsubmitAll(type)
      .then((response) => response.data)
      .then((data) => {
        dispatch(
          setNotification(translations.unsubmitAllSubmissionsJobPending),
        );
        if (data.redirect_url) {
          pollJob(
            data.redirect_url,
            UNSUBMIT_ALL_SUBMISSIONS_JOB_POLL_INTERVAL,
            handleSuccess,
            handleFailure,
          );
        } else {
          handleSuccess();
        }
      })
      .catch(handleFailure);
  };
}

export function deleteSubmission(submissionId, successMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions
      .deleteSubmission(submissionId)
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_SUBMISSION_SUCCESS,
        });
        dispatch(setNotification(successMessage));
        fetchSubmissions()(dispatch);
      })
      .catch(() => {
        dispatch({
          type: actionTypes.DELETE_SUBMISSION_FAILURE,
        });
        dispatch(setNotification(translations.requestFailure));
      });
  };
}

export function deleteAllSubmissions(type) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_ALL_SUBMISSIONS_REQUEST });

    const handleSuccess = () => {
      dispatch({ type: actionTypes.DELETE_ALL_SUBMISSIONS_SUCCESS });
      dispatch(setNotification(translations.deleteAllSubmissionsSuccess));
      fetchSubmissions()(dispatch);
    };

    const handleFailure = () => {
      dispatch({ type: actionTypes.DELETE_ALL_SUBMISSIONS_FAILURE });
      dispatch(setNotification(translations.requestFailure));
    };

    return CourseAPI.assessment.submissions
      .deleteAll(type)
      .then((response) => response.data)
      .then((data) => {
        dispatch(setNotification(translations.deleteAllSubmissionsJobPending));
        if (data.redirect_url) {
          pollJob(
            data.redirect_url,
            DELETE_ALL_SUBMISSIONS_JOB_POLL_INTERVAL,
            handleSuccess,
            handleFailure,
          );
        } else {
          handleSuccess();
        }
      })
      .catch(handleFailure);
  };
}
