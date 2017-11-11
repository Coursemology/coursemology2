import CourseAPI from 'api/course';
import history from 'lib/history';
import { getCourseId, getAssessmentId, getScribingId } from 'lib/helpers/url-helpers';
import { SubmissionError } from 'redux-form';
import actionTypes from '../constants';

// Helper function to redirect to assessment main page
function redirectToAssessment() {
  history.push(`/courses/${getCourseId()}/assessments/${getAssessmentId()}`);
  window.location.href = `/courses/${getCourseId()}/assessments/${getAssessmentId()}`;
}

export function fetchSkills() {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SKILLS_REQUEST });
    return CourseAPI.assessment.assessments.fetchSkills()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_SKILLS_SUCCESS,
          skills: response.data.skills,
        });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.FETCH_SKILLS_FAILURE });
        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function fetchScribingQuestion() {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SCRIBING_QUESTION_REQUEST });
    return CourseAPI.question.scribing.scribings.fetch()
      .then((response) => {
        dispatch({
          scribingId: getScribingId(),
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
  // Need to return array of empty string if nothing
  // If not, backend will barf
  if (skills.length <= 0) { return ['']; }

  const skillIds = [];
  skills.forEach(skill => skillIds.push(skill.id));
  return skillIds;
}

// Helper function to process form fields before create/update
function processFields(fields) {
  // Deep clone JSON fields
  const parsedFields = JSON.parse(JSON.stringify(fields));

  parsedFields.question_scribing.skill_ids =
    getSkillIdsFromSkills(fields.question_scribing.skill_ids);

  if (fields.question_scribing.attachment) {
    parsedFields.question_scribing.file = fields.question_scribing.attachment[0];
  } else {
    delete parsedFields.question_scribing.file;
  }

  delete parsedFields.question_scribing.attachment;

  return parsedFields;
}

export function clearSubmitError() {
  return (dispatch) => {
    dispatch({
      type: actionTypes.CLEAR_SUBMIT_ERROR,
    });
  };
}

export function createScribingQuestion(fields) {
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_SCRIBING_QUESTION_REQUEST });
    const parsedFields = processFields(fields);
    CourseAPI.question.scribing.scribings.create(parsedFields)
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
          saveErrors: error.response && error.response.data && error.response.data.errors,
        });
      });
  };
}

export function updateScribingQuestion(questionId, fields) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SCRIBING_QUESTION_REQUEST });
    const parsedFields = processFields(fields);
    CourseAPI.question.scribing.scribings.update(questionId, parsedFields)
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
          saveErrors: error.response && error.response.data && error.response.data.errors,
        });
      });
  };
}
