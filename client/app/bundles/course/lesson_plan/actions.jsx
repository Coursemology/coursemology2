import axios from 'axios';
import actionTypes from './constants';

export function toggleItemTypeVisibility(itemType) {
  return {
    type: actionTypes.TOGGLE_LESSON_PLAN_ITEM_TYPE_VISIBILITY,
    itemType,
  };
}

function combineDateTime(dateSource, timeSource) {
  const combinedDateTime = dateSource || new Date();
  if (timeSource) {
    combinedDateTime.setHours(timeSource.getHours());
    combinedDateTime.setMinutes(timeSource.getMinutes());
  }
  return combinedDateTime;
}

function patchRequest(endpoint, payload, successHandler, failureHandler) {
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  const headers = { Accept: 'application/json' };
  axios.patch(endpoint, { ...payload, authenticity_token: csrfToken }, { headers })
    .then(successHandler)
    .catch(failureHandler);
}

export function updateItemField(id, field, value, oldValue) {
  const payload = {
    item: {
      [field]: value,
    },
  };

  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_ITEM_FIELD,
      payload: {
        id,
        field,
        value,
      },
    });

    const successHandler = () => {
      // TODO Feedback to user
    };

    const failureHandler = () => {
      dispatch({
        type: actionTypes.SET_ITEM_FIELD,
        payload: {
          id,
          field,
          value: oldValue,
        },
      });
    };

    patchRequest(`items/${id}`, payload, successHandler, failureHandler);
  };
}

export function updateItemDateTime(id, field, dateSource, timeSource, oldValue) {
  const newDateTime = combineDateTime(dateSource, timeSource);
  return updateItemField(id, field, newDateTime, oldValue);
}

/**
 * Milestones do not have the end_at field.
 */
export function updateMilestoneDateTime(milestoneId, dateSource, timeSource, oldValue) {
  const newDateTime = combineDateTime(dateSource, timeSource);
  const payload = {
    lesson_plan_milestone: {
      start_at: newDateTime,
    },
  };

  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_MILESTONE_FIELD,
      payload: {
        field: 'start_at',
        id: milestoneId,
        value: newDateTime,
      },
    });

    const successHandler = () => {
      // TODO Feedback to user
    };

    const failureHandler = () => {
      dispatch({
        type: actionTypes.SET_MILESTONE_FIELD,
        payload: {
          field: 'start_at',
          id: milestoneId,
          value: oldValue,
        },
      });
    };

    patchRequest(`milestones/${milestoneId}`, payload, successHandler, failureHandler);
  };
}
