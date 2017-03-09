import CourseAPI from 'api/course';
import { submit, arrayPush, SubmissionError } from 'redux-form';
import actionTypes, { formNames } from '../constants';
import { setNotification } from './index';

export function showQuestionForm(formParams) {
  return { type: actionTypes.QUESTION_FORM_SHOW, formParams };
}

export function hideQuestionForm() {
  return { type: actionTypes.QUESTION_FORM_HIDE };
}

export function submitQuestionForm() {
  return dispatch => dispatch(submit(formNames.SURVEY_QUESTION));
}

export function addToOptions(option) {
  return dispatch => dispatch(arrayPush(formNames.SURVEY_QUESTION, 'options', option));
}

export function addToOptionsToDelete(option) {
  return dispatch => dispatch(arrayPush(formNames.SURVEY_QUESTION, 'optionsToDelete', option));
}

export function createSurveyQuestion(
  fields,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SURVEY_QUESTION_REQUEST });
    return CourseAPI.survey.questions.create(fields)
      .then((response) => {
        dispatch({
          surveyId: CourseAPI.survey.responses.getSurveyId(),
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
    return CourseAPI.survey.questions.update(questionId, data)
      .then((response) => {
        dispatch({
          surveyId: CourseAPI.survey.responses.getSurveyId(),
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

export function deleteSurveyQuestion(
  question,
  successMessage,
  failureMessage
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SURVEY_QUESTION_REQUEST });
    return CourseAPI.survey.questions.delete(question.id)
      .then(() => {
        dispatch({
          surveyId: CourseAPI.survey.responses.getSurveyId(),
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
