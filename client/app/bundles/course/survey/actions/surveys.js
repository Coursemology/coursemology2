import { submit, SubmissionError } from 'redux-form';
import CourseAPI from 'api/course';
import history from 'lib/history';
import { getCourseId } from 'lib/helpers/url-helpers';
import actionTypes, { formNames } from '../constants';
import { setNotification } from './index';

export function showSurveyForm(formParams) {
  return { type: actionTypes.SURVEY_FORM_SHOW, formParams };
}

export function hideSurveyForm() {
  return { type: actionTypes.SURVEY_FORM_HIDE };
}

export function submitSurveyForm() {
  return (dispatch) => {
    dispatch(submit(formNames.SURVEY));
  };
}

export function createSurvey(
  surveyFields,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_REQUEST });
    return CourseAPI.survey.surveys.create(surveyFields)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_SURVEY_SUCCESS,
          survey: response.data,
        });
        dispatch(hideSurveyForm());
        setNotification(successMessage)(dispatch);
        const courseId = getCourseId();
        history.push(`/courses/${courseId}/surveys/${response.data.id}`);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_SURVEY_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function fetchSurvey(surveyId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEY_REQUEST, surveyId });
    return CourseAPI.survey.surveys.fetch(surveyId)
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_SURVEY_SUCCESS,
          survey: response.data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.LOAD_SURVEY_FAILURE, surveyId });
      });
  };
}

export function fetchSurveys() {
  return (dispatch) => {
    dispatch({ type: actionTypes.LOAD_SURVEYS_REQUEST });

    return CourseAPI.survey.surveys.index()
      .then((response) => {
        dispatch({
          type: actionTypes.LOAD_SURVEYS_SUCCESS,
          surveys: response.data.surveys,
          canCreate: response.data.canCreate,
        });
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
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SURVEY_REQUEST, surveyId });
    return CourseAPI.survey.surveys.update(surveyId, surveyFields)
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
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function deleteSurvey(surveyId, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SURVEY_REQUEST, surveyId });
    return CourseAPI.survey.surveys.delete(surveyId)
      .then(() => {
        history.push(`/courses/${getCourseId()}/surveys/`);
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
    return CourseAPI.survey.surveys.results(surveyId)
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

export function sendReminderEmail(successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.SEND_REMINDER_REQUEST });
    return CourseAPI.survey.surveys.remind()
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
