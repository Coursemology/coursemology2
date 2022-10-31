import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import CourseAPI from 'api/course';
import { getSurveyId } from 'lib/helpers/url-helpers';
import actionTypes from '../constants';
import { setNotification } from './index';

export function showQuestionForm(formParams) {
  return { type: actionTypes.QUESTION_FORM_SHOW, formParams };
}

export function hideQuestionForm() {
  return { type: actionTypes.QUESTION_FORM_HIDE };
}

/**
 * Changes which section the specified question belongs to.
 *
 * @param {boolean} prepend
 *   true if item is to be prepended to the traget section,
 *   false if it to be appended.
 * @param {number} sourceIndex
 *   The array index of the question being moved.
 * @param {number} sourceSectionIndex
 *   The array index of the section that the question is being moved form.
 * @param {number} targetSectionIndex
 *   The array index of the section that the question is being moved to.
 * @return {Object} The action
 */
export function changeSection(
  prepend,
  sourceIndex,
  sourceSectionIndex,
  targetSectionIndex,
) {
  return {
    type: actionTypes.CHANGE_QUESTION_SECTION,
    surveyId: getSurveyId(),
    prepend,
    sourceIndex,
    sourceSectionIndex,
    targetSectionIndex,
  };
}

/**
 * Reorders a question within a section.
 *
 * @param {number} sectionIndex
 *   The array index of the section that the question is being moved within.
 * @param {number} sourceIndex
 *   The original index of the question
 * @param {number} targetIndex
 *   The new index of the question
 * @return {Object} The action
 */
export function reorder(sectionIndex, sourceIndex, targetIndex) {
  return {
    type: actionTypes.REORDER_QUESTION,
    surveyId: getSurveyId(),
    sectionIndex,
    sourceIndex,
    targetIndex,
  };
}

/**
 * Persists the new ordering if some question has been moved.
 *
 * @param {string} successMessage
 * @param {string} failureMessage
 */
export function finalizeOrder(successMessage, failureMessage) {
  return (dispatch, getState) => {
    const {
      surveysFlags: { isQuestionMoved },
      surveys,
    } = getState();
    if (!isQuestionMoved) {
      return;
    }

    const surveyId = getSurveyId();
    const survey = surveys.find((item) => String(item.id) === surveyId);
    const ordering = survey.sections.map((section) => [
      section.id,
      section.questions.map((question) => question.id),
    ]);

    dispatch({ type: actionTypes.UPDATE_QUESTION_ORDER_REQUEST });
    CourseAPI.survey.surveys
      .reorderQuestions({ ordering })
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_QUESTION_ORDER_SUCCESS,
          survey: response.data,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.UPDATE_QUESTION_ORDER_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}

export function createSurveyQuestion(
  fields,
  successMessage,
  failureMessage,
  setError,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_QUESTION_REQUEST });
    return CourseAPI.survey.questions
      .create(fields)
      .then((response) => {
        dispatch({
          surveyId: getSurveyId(),
          sectionId: response.data.section_id,
          type: actionTypes.CREATE_SURVEY_QUESTION_SUCCESS,
          question: response.data,
        });
        dispatch(hideQuestionForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_SURVEY_QUESTION_FAILURE });
        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        dispatch(setNotification(failureMessage));
      });
  };
}

export function updateSurveyQuestion(
  questionId,
  data,
  successMessage,
  failureMessage,
  setError,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SURVEY_QUESTION_REQUEST });
    return CourseAPI.survey.questions
      .update(questionId, data)
      .then((response) => {
        dispatch({
          surveyId: getSurveyId(),
          sectionId: response.data.section_id,
          type: actionTypes.UPDATE_SURVEY_QUESTION_SUCCESS,
          question: response.data,
        });
        dispatch(hideQuestionForm());
        setNotification(successMessage)(dispatch);
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_SURVEY_QUESTION_FAILURE });
        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        dispatch(setNotification(failureMessage));
      });
  };
}

export function deleteSurveyQuestion(question, successMessage, failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SURVEY_QUESTION_REQUEST });
    return CourseAPI.survey.questions
      .delete(question.id)
      .then(() => {
        dispatch({
          surveyId: getSurveyId(),
          sectionId: question.section_id,
          questionId: question.id,
          type: actionTypes.DELETE_SURVEY_QUESTION_SUCCESS,
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: actionTypes.DELETE_SURVEY_QUESTION_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}
