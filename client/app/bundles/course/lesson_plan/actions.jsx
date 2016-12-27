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

function updateLessonPlanElement(endpoint, payload, successHandler, failureHandler) {
  const xhr = new XMLHttpRequest();
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  const requestBody = JSON.stringify({
    authenticity_token: csrfToken,
    ...payload,
  });
  const responseHandler = () => {
    if (xhr.status === 200) {
      successHandler();
    } else {
      failureHandler();
    }
  };

  xhr.onload = () => { responseHandler(); };
  xhr.ontimeout = () => { failureHandler(); };
  xhr.open('PATCH', endpoint);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.send(requestBody);
}

export function updateItemField(id, field, value) {
  const payload = {
    item: {
      [field]: value,
    },
  };

  return (dispatch) => {
    const successHandler = () => {
      dispatch({
        type: actionTypes.SET_ITEM_FIELD,
        payload: {
          id,
          field,
          value,
        },
      });
    };

    const failureHandler = () => {
      // TODO
    };

    updateLessonPlanElement(`items/${id}`, payload, successHandler, failureHandler);
  };
}

export function updateItemDateTime(id, field, dateSource, timeSource) {
  const newDateTime = combineDateTime(dateSource, timeSource);
  return updateItemField(id, field, newDateTime);
}

/**
 * Milestones do not have the end_at field.
 */
export function updateMilestoneDateTime(milestoneId, dateSource, timeSource) {
  const newDateTime = combineDateTime(dateSource, timeSource);
  const payload = {
    lesson_plan_milestone: {
      start_at: newDateTime,
    },
  };

  return (dispatch) => {
    const successHandler = () => {
      dispatch({
        type: actionTypes.SET_MILESTONE_FIELD,
        payload: {
          field: 'start_at',
          id: milestoneId,
          value: newDateTime,
        },
      });
    };

    const failureHandler = () => {
      // TODO
    };

    updateLessonPlanElement(`milestones/${milestoneId}`, payload, successHandler, failureHandler);
  };
}
