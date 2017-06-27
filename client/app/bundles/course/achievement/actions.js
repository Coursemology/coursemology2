import { SubmissionError } from 'redux-form';
import CourseAPI from 'api/course';
import { getCourseId } from 'lib/helpers/url-helpers';
import actionTypes from './constants';

/**
 * Prepares and maps object attributes to a FormData object for an AJAX request.
 * Expected attributes shape:
 *   { achievement :
 *     { title, description, badge: file }
 *   }
 *
 * @param {Object} attributes
 * @return {FormData} The updated item
 */
const formatAttributes = (data) => {
  const payload = new FormData();

  ['title', 'description', 'published'].forEach((field) => {
    if (data[field] !== undefined && data[field] !== null) {
      payload.append(`achievement[${field}]`, data[field]);
    }
  });
  payload.append('achievement[badge]', data.badge.file);

  return payload;
};

export function createAchievement(data, successMessage, failureMessage) {
  const attributes = formatAttributes(data.achievement);
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_ACHIEVEMENT_REQUEST });

    return CourseAPI.achievements.create(attributes)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_ACHIEVEMENT_SUCCESS,
          message: successMessage,
        });
        // TODO: Remove redirection when achievement index is implemented using React.
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${getCourseId()}/achievements/${response.data.id}`;
          }
        }, 200);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.CREATE_ACHIEVEMENT_FAILURE,
          message: failureMessage,
        });

        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function updateAchievement(achievementId, data, successMessage, failureMessage) {
  const attributes = formatAttributes(data.achievement);
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_ACHIEVEMENT_REQUEST });

    return CourseAPI.achievements.update(achievementId, attributes)
      .then(() => {
        dispatch({
          type: actionTypes.UPDATE_ACHIEVEMENT_SUCCESS,
          message: successMessage,
        });
        // TODO: Remove redirection when achievement index is implemented using React.
        setTimeout(() => {
          window.location =
            `/courses/${getCourseId()}/achievements`;
        }, 500);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.UPDATE_ACHIEVEMENT_FAILURE,
          message: failureMessage,
        });

        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}
