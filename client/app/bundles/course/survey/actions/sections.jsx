import { submit, SubmissionError } from 'redux-form';
import CourseAPI from 'api/course';
import { getSurveyId } from 'lib/helpers/url-helpers';
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

export function createSurveySection(fields, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_SECTION_REQUEST });
    return CourseAPI.survey.sections
      .create(fields)
      .then((response) => {
        dispatch({
          surveyId: getSurveyId(),
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
    return CourseAPI.survey.sections
      .update(sectionId, data)
      .then((response) => {
        dispatch({
          surveyId: getSurveyId(),
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

export function deleteSurveySection(sectionId, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SURVEY_SECTION_REQUEST });
    return CourseAPI.survey.sections
      .delete(sectionId)
      .then(() => {
        dispatch({
          surveyId: getSurveyId(),
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

/**
 * Changes the order of survey sections so that the section originally at index oldIndex
 * is moved to newIndex.
 *
 * @param {number} oldIndex
 * @param {number} newIndex
 * @param {string} successMessage
 * @param {string} failureMessage
 */
export function changeSectionOrder(
  oldIndex,
  newIndex,
  successMessage,
  failureMessage
) {
  return (dispatch, getState) => {
    const { surveys } = getState();
    const surveyId = getSurveyId();
    const survey = surveys.find((item) => String(item.id) === surveyId);
    const ordering = survey.sections.map((section) => section.id);
    ordering.splice(newIndex, 0, ordering.splice(oldIndex, 1)[0]);

    dispatch({ type: actionTypes.UPDATE_SECTION_ORDER_REQUEST });
    CourseAPI.survey.surveys
      .reorderSections({ ordering })
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_SECTION_ORDER_SUCCESS,
          survey: response.data,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.UPDATE_SECTION_ORDER_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
