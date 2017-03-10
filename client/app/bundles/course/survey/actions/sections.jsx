import { submit, SubmissionError } from 'redux-form';
import CourseAPI from 'api/course';
import actionTypes, { formNames } from '../constants';
import { setNotification } from './index';

export function showSectionForm(formParams) {
  return { type: actionTypes.SECTION_FORM_SHOW, formParams };
}

export function hideSectionForm() {
  return { type: actionTypes.SECTION_FORM_HIDE };
}

export function submitSectionForm() {
  return (dispatch) => {
    dispatch(submit(formNames.SURVEY_SECTION));
  };
}

export function createSurveySection(
  fields,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_SECTION_REQUEST });
    return CourseAPI.survey.sections.create(fields)
      .then((response) => {
        dispatch({
          surveyId: CourseAPI.survey.responses.getSurveyId(),
          type: actionTypes.CREATE_SURVEY_SECTION_SUCCESS,
          section: response.data,
        });
        dispatch(hideSectionForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_SURVEY_SECTION_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function updateSurveySection(
  sectionId,
  data,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SURVEY_SECTION_REQUEST });
    return CourseAPI.survey.sections.update(sectionId, data)
      .then((response) => {
        dispatch({
          surveyId: CourseAPI.survey.responses.getSurveyId(),
          type: actionTypes.UPDATE_SURVEY_SECTION_SUCCESS,
          section: response.data,
        });
        dispatch(hideSectionForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_SURVEY_SECTION_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function deleteSurveySection(
  sectionId,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SURVEY_SECTION_REQUEST });
    return CourseAPI.survey.sections.delete(sectionId)
      .then(() => {
        dispatch({
          surveyId: CourseAPI.survey.responses.getSurveyId(),
          sectionId,
          type: actionTypes.DELETE_SURVEY_SECTION_SUCCESS,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.DELETE_SURVEY_SECTION_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
