import { Operation } from 'store';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getCourseId, getScribingId } from 'lib/helpers/url-helpers';

import actionTypes from './constants';
import { processFields, redirectToAssessment } from './utils';

export const fetchSkills = (): Operation => {
  return async (dispatch) => {
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
};

export const fetchScribingQuestion = (failureMessage): Operation => {
  return async (dispatch) => {
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
};

export const createScribingQuestion = (
  fields,
  failureMessage,
  setError,
): Operation => {
  return async (dispatch) => {
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
        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
};

export const updateScribingQuestion = (
  questionId,
  fields,
  failureMessage,
  setError,
): Operation => {
  return async (dispatch) => {
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
        if (error?.response?.data?.errors) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });
  };
};
