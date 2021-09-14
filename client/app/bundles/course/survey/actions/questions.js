import CourseAPI from 'api/course';
import { submit, arrayPush, SubmissionError } from 'redux-form';
import { getSurveyId } from 'lib/helpers/url-helpers';
import actionTypes, { formNames } from '../constants';
import { setNotification } from './index';

export function showQuestionForm(formParams) {
  return { type: actionTypes.QUESTION_FORM_SHOW, formParams };
}

export function hideQuestionForm() {
  return { type: actionTypes.QUESTION_FORM_HIDE };
}

export function submitQuestionForm() {
  return (dispatch) => dispatch(submit(formNames.SURVEY_QUESTION));
}

export function addToOptions(option) {
  return (dispatch) =>
    dispatch(arrayPush(formNames.SURVEY_QUESTION, 'options', option));
}

export function addToOptionsToDelete(option) {
  return (dispatch) =>
    dispatch(arrayPush(formNames.SURVEY_QUESTION, 'optionsToDelete', option));
}

/**
 * Sets the index of the current question being dragged, as well as the id and index of the section
 * it currently belongs to. These values may change as the question is being dragged around,
 * which is why they are not specified in the item descriptor created by `beginDrag` instead.
 *
 * @param {number} index
 * @param {number} sectionIndex
 * @param {number} sectionId
 * @return {Object} The action
 */
export function setDraggedQuestion(index, sectionIndex, sectionId) {
  return {
    type: actionTypes.SET_DRAGGED_QUESTION,
    surveyId: getSurveyId(),
    index,
    sectionIndex,
    sectionId,
  };
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
  targetSectionIndex
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

export function createSurveyQuestion(fields, successMessage, failureMessage) {
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
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
      });
  };
}

export function updateSurveyQuestion(
  questionId,
  data,
  successMessage,
  failureMessage
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
          throw new SubmissionError(error.response.data.errors);
        } else {
          setNotification(failureMessage)(dispatch);
        }
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
