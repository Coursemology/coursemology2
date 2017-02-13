import axios from 'lib/axios';
import actionTypes from './constants';

export function toggleItemTypeVisibility(itemType) {
  return {
    type: actionTypes.TOGGLE_LESSON_PLAN_ITEM_TYPE_VISIBILITY,
    itemType,
  };
}

export function setNotification(message) {
  const duration = 1500;

  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_SURVEY_NOTIFICATION,
      message,
    });
    setTimeout(() => {
      dispatch({ type: actionTypes.RESET_SURVEY_NOTIFICATION });
    }, duration);
  };
}

export function genericUpdate(
  endpoint,
  id,
  payload,
  newValues,
  successMessage,
  errorMessage,
  requestAction,
  successAction,
  failureAction
) {
  return (dispatch) => {
    dispatch({ type: requestAction, payload: { id } });

    return axios.patch(endpoint, payload)
      .then(() => {
        dispatch({
          type: successAction,
          payload: {
            id,
            newValues,
          },
        });
        setNotification(successMessage)(dispatch);
      })
      .catch(() => {
        dispatch({ type: failureAction, payload: { id } });
        setNotification(errorMessage)(dispatch);
      });
  };
}

function shiftDate(newValues, oldValues) {
  if (!newValues.start_at || !oldValues.start_at ||
      (!oldValues.bonus_end_at && !oldValues.end_at)) {
    return newValues;
  }
  const newStartAt = new Date(newValues.start_at).getTime();
  const oldStartAt = new Date(oldValues.start_at).getTime();
  const diff = newStartAt - oldStartAt;
  const shiftedDates = {};

  if (oldValues.bonus_end_at) {
    const oldBonusEndAt = new Date(oldValues.bonus_end_at).getTime();
    if (oldBonusEndAt >= oldStartAt) {
      shiftedDates.bonus_end_at = new Date(oldBonusEndAt + diff);
    }
  }

  if (oldValues.end_at) {
    const oldEndAt = new Date(oldValues.end_at).getTime();
    if (oldEndAt >= oldStartAt) {
      shiftedDates.end_at = new Date(oldEndAt + diff);
    }
  }

  return Object.assign(shiftedDates, newValues);
}

export function updateItem(id, newValues, oldValues, successMessage, errorMessage) {
  const updatedValues = shiftDate(newValues, oldValues);
  const payload = {
    item: updatedValues,
  };

  return genericUpdate(
    `items/${id}`,
    id,
    payload,
    updatedValues,
    successMessage,
    errorMessage,
    actionTypes.ITEM_UPDATE_REQUEST,
    actionTypes.ITEM_UPDATE_SUCCESS,
    actionTypes.ITEM_UPDATE_FAILURE
  );
}

export function updateMilestone(id, newValues, oldValues, successMessage, errorMessage) {
  const payload = {
    lesson_plan_milestone: newValues,
  };

  return genericUpdate(
    `milestones/${id}`,
    id,
    payload,
    newValues,
    successMessage,
    errorMessage,
    actionTypes.MILESTONE_UPDATE_REQUEST,
    actionTypes.MILESTONE_UPDATE_SUCCESS,
    actionTypes.MILESTONE_UPDATE_FAILURE
  );
}
