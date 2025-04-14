import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import pollJob from 'lib/helpers/jobHelpers';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getCourseId } from 'lib/helpers/url-helpers';

import actionTypes from '../constants';
import translations from '../translations';

const DOWNLOAD_JOB_POLL_INTERVAL_MS = 2000;

export function showSurveyForm(formParams) {
  return { type: actionTypes.SURVEY_FORM_SHOW, formParams };
}

export function hideSurveyForm() {
  return { type: actionTypes.SURVEY_FORM_HIDE };
}

export function createSurvey(
  surveyFields,
  successMessage,
  failureMessage,
  navigate,
  setError,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_REQUEST });
    return CourseAPI.survey.surveys
      .create(surveyFields)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_SURVEY_SUCCESS,
          survey: response.data,
        });
        dispatch(hideSurveyForm());
        setNotification(successMessage)(dispatch);
        const courseId = getCourseId();
        navigate(`/courses/${courseId}/surveys/${response.data.id}`);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_SURVEY_FAILURE });
        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        dispatch(setNotification(failureMessage));
      });
  };
}

export function loadSurvey(survey) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.LOAD_SURVEY_SUCCESS,
      survey,
    });
  };
}

export function loadSurveys(data) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.LOAD_SURVEYS_SUCCESS,
      surveys: data.surveys,
      canCreate: data.canCreate,
      studentsCount: data.studentsCount,
    });
  };
}

export function fetchSurvey(surveyId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEY_REQUEST, surveyId });
    return CourseAPI.survey.surveys
      .fetch(surveyId)
      .then((response) => {
        loadSurvey(response.data)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_SURVEY_FAILURE, surveyId });
      });
  };
}

export function fetchSurveys() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEYS_REQUEST });

    return CourseAPI.survey.surveys
      .index()
      .then((response) => {
        loadSurveys(response.data)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_SURVEYS_FAILURE });
      });
  };
}

export function updateSurvey(
  surveyId,
  surveyFields,
  successMessage,
  failureMessage,
  setError,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SURVEY_REQUEST, surveyId });
    return CourseAPI.survey.surveys
      .update(surveyId, surveyFields)
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_SURVEY_SUCCESS,
          survey: response.data,
        });
        dispatch(hideSurveyForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_SURVEY_FAILURE, surveyId });
        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        dispatch(setNotification(failureMessage));
      });
  };
}

export function deleteSurvey(
  surveyId,
  successMessage,
  failureMessage,
  navigate,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SURVEY_REQUEST, surveyId });
    return CourseAPI.survey.surveys
      .delete(surveyId)
      .then(() => {
        navigate(`/courses/${getCourseId()}/surveys`);
        dispatch({
          surveyId,
          type: actionTypes.DELETE_SURVEY_SUCCESS,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.DELETE_SURVEY_FAILURE, surveyId });
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function fetchResults(surveyId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEY_RESULTS_REQUEST, surveyId });
    return CourseAPI.survey.surveys
      .results(surveyId)
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_SURVEY_RESULTS_SUCCESS,
          survey: response.data.survey,
          sections: response.data.sections,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_SURVEY_RESULTS_FAILURE, surveyId });
      });
  };
}

export function sendReminderEmail(successMessage, failureMessage, courseUsers) {
  return (dispatch) => {
    dispatch({ type: actionTypes.SEND_REMINDER_REQUEST });
    return CourseAPI.survey.surveys
      .remind(courseUsers)
      .then(() => {
        dispatch({ type: actionTypes.SEND_REMINDER_SUCCESS });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.SEND_REMINDER_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function downloadSurvey() {
  return (dispatch) => {
    dispatch({ type: actionTypes.DOWNLOAD_SURVEY_REQUEST });

    const handleSuccess = (successData) => {
      window.location.href = successData.redirectUrl;
      dispatch({ type: actionTypes.DOWNLOAD_SURVEY_SUCCESS });
    };

    const handleFailure = () => {
      dispatch({ type: actionTypes.DOWNLOAD_SURVEY_FAILURE });
      dispatch(setNotification(translations.requestFailure));
    };

    return CourseAPI.survey.surveys
      .download()
      .then((response) => {
        pollJob(
          response.data.jobUrl,
          handleSuccess,
          handleFailure,
          DOWNLOAD_JOB_POLL_INTERVAL_MS,
        );
      })
      .catch(handleFailure);
  };
}
