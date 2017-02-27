import _ from 'lodash';
import CourseAPI from 'api/course';
import { getCourseId, getAssessmentId, getScribingId } from 'lib/helpers/url-helpers';
import { submit, SubmissionError } from 'redux-form';
import actionTypes, { formNames } from '../constants';

export function submitForm() {
  return (dispatch) => {
    dispatch(submit(formNames.SCRIBING_QUESTION));
  };
}

export function fetchScribingQuestion(scribingId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SCRIBING_QUESTION_REQUEST });
    return CourseAPI.scribing.scribings.fetch(scribingId)
      .then((response) => {
        dispatch({
          scribingId: CourseAPI.scribing.scribings.getScribingId(),
          type: actionTypes.FETCH_SCRIBING_QUESTION_SUCCESS,
          data: response.data,
        });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.FETCH_SCRIBING_QUESTION_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

// Helper function to convert array of skills to array of skill_ids
function getSkillIdsFromSkills(skills) {
  const ids = _.map(skills, skill => skill.id);
  return (ids.length > 0) ? ids : [''];
}

export function createScribingQuestion(fields) {
  const parsedFields = _.cloneDeep(fields);
  parsedFields.question_scribing.skill_ids =
    getSkillIdsFromSkills(fields.question_scribing.skill_ids);

  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SCRIBING_QUESTION_REQUEST });
    return CourseAPI.scribing.scribings.create(fields)
      .then((response) => {
        dispatch({
          scribingId: getScribingId(),
          type: actionTypes.CREATE_SCRIBING_QUESTION_SUCCESS,
          question: response.data,
        });
        const courseId = getCourseId();
        const assessmentId = getAssessmentId();
        window.location.href = `/courses/${courseId}/assessments/${assessmentId}`;
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_SCRIBING_QUESTION_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function updateScribingQuestion(questionId, data) {
  return (dispatch) => {
    const parsedData = _.cloneDeep(data);
    parsedData.question_scribing.skill_ids =
      getSkillIdsFromSkills(data.question_scribing.skill_ids);

    dispatch({ type: actionTypes.UPDATE_SCRIBING_QUESTION_REQUEST });
    return CourseAPI.scribing.scribings.update(questionId, parsedData)
      .then((response) => {
        dispatch({
          scribingId: getScribingId(),
          type: actionTypes.UPDATE_SCRIBING_QUESTION_SUCCESS,
          question: response.data,
        });

        const courseId = getCourseId();
        const assessmentId = getAssessmentId();
        window.location.href = `/courses/${courseId}/assessments/${assessmentId}`;
      })
      .catch((error) => {
        dispatch({ type: actionTypes.UPDATE_SCRIBING_QUESTION_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function deleteScribingQuestion(question) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_SCRIBING_QUESTION_REQUEST });
    return CourseAPI.scribing.scribings.delete(question.id)
      .then(() => {
        dispatch({
          scribingId: CourseAPI.scribing.scribings.getScribingId(),
          questionId: question.id,
          type: actionTypes.DELETE_SCRIBING_QUESTION_SUCCESS,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.DELETE_SCRIBING_QUESTION_FAILURE });
      });
  };
}

