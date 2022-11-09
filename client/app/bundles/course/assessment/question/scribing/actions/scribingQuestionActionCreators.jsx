import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import {
  getAssessmentId,
  getCourseId,
  getScribingId,
} from 'lib/helpers/url-helpers';
import history from 'lib/history';

import actionTypes from '../constants';

// Helper function to redirect to assessment main page
function redirectToAssessment() {
  history.push(`/courses/${getCourseId()}/assessments/${getAssessmentId()}`);
  window.location.href = `/courses/${getCourseId()}/assessments/${getAssessmentId()}`;
}

export function fetchSkills() {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SKILLS_REQUEST });
    return CourseAPI.assessment.assessments
      .fetchSkills()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_SKILLS_SUCCESS,
          skills: response.data.skills,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_SKILLS_FAILURE });
      });
  };
}

export function fetchScribingQuestion(failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SCRIBING_QUESTION_REQUEST });
    return CourseAPI.assessment.question.scribing
      .fetch()
      .then((response) => {
        dispatch({
          scribingId: getScribingId(),
          type: actionTypes.FETCH_SCRIBING_QUESTION_SUCCESS,
          data: response.data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_SCRIBING_QUESTION_FAILURE });
        setNotification(failureMessage)(dispatch);
      });
  };
}

// Helper function to process form fields before create/update
function processFields(fields) {
  // Deep clone JSON fields
  const parsedFields = JSON.parse(JSON.stringify(fields));

  // Modify the structure of `parsedFields` so it matches what non React forms
  // pass to the Rails backend.
  parsedFields.question_assessment = {};
  if (fields.skill_ids.length < 1) {
    parsedFields.question_assessment.skill_ids = [''];
  } else {
    parsedFields.question_assessment.skill_ids = parsedFields.skill_ids;
  }

  if (fields.attachment) {
    parsedFields.file = fields.attachment.file;
  } else {
    delete parsedFields.file;
  }

  delete parsedFields.attachment;
  delete parsedFields.skill_ids;

  return { question_scribing: parsedFields };
}

export function createScribingQuestion(fields, failureMessage, setError) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SCRIBING_QUESTION_REQUEST });
    const parsedFields = processFields(fields);
    CourseAPI.assessment.question.scribing
      .create(parsedFields)
      .then(() => {
        redirectToAssessment();
        dispatch({
          scribingId: getScribingId(),
          type: actionTypes.CREATE_SCRIBING_QUESTION_SUCCESS,
          courseId: getCourseId(),
        });
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.CREATE_SCRIBING_QUESTION_FAILURE,
        });
        setNotification(failureMessage)(dispatch);
        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
}

export function updateScribingQuestion(
  questionId,
  fields,
  failureMessage,
  setError,
) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SCRIBING_QUESTION_REQUEST });
    const parsedFields = processFields(fields);
    CourseAPI.assessment.question.scribing
      .update(questionId, parsedFields)
      .then(() => {
        redirectToAssessment();
        dispatch({
          scribingId: getScribingId(),
          type: actionTypes.UPDATE_SCRIBING_QUESTION_SUCCESS,
        });
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.UPDATE_SCRIBING_QUESTION_FAILURE,
        });
        setNotification(failureMessage)(dispatch);
        if (error.response && error.response.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
}
