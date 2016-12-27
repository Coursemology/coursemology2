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

export function updateItemDateTime(itemId, field, dateSource, timeSource) {
  const newDateTime = combineDateTime(dateSource, timeSource);
  const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
  const requestBody = JSON.stringify({
    authenticity_token: csrfToken,
    item: {
      [field]: newDateTime,
    },
  });

  return (dispatch) => {
    const successHandler = () => {
      dispatch({
        type: actionTypes.SET_ITEM_FIELD,
        payload: {
          field,
          id: itemId,
          value: newDateTime,
        },
      });
    };

    const failureHandler = () => {
      // TODO
    };

    const responseHandler = (xhr) => {
      if (xhr.status === 200) {
        successHandler();
      } else {
        failureHandler();
      }
    };

    const xhr = new XMLHttpRequest();
    xhr.onload = () => { responseHandler(xhr); };
    xhr.ontimeout = () => { failureHandler(); };
    xhr.open('PATCH', `items/${itemId}`);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send(requestBody);
  };
}
