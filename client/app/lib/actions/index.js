import actionTypes from 'lib/constants';
import { change } from 'redux-form';

export function setNotification(message) {
  return dispatch => dispatch({
    type: actionTypes.SET_NOTIFICATION,
    message,
  });
}

export function resetDeleteConfirmation() {
  return { type: actionTypes.RESET_DELETE_CONFIRMATION };
}

export function showDeleteConfirmation(onConfirm) {
  return (dispatch) => {
    const confirmAndDismiss = () => {
      onConfirm();
      dispatch(resetDeleteConfirmation());
    };
    dispatch({ type: actionTypes.SHOW_DELETE_CONFIRMATION, onConfirm: confirmAndDismiss });
  };
}

export function shiftEndDate(formName, newStartAt, oldValues, startAtField = 'start_at', endAtField = 'end_at') {
  return (dispatch) => {
    const { [startAtField]: oldStartAt, [endAtField]: oldEndAt } = oldValues;
    if (!oldStartAt || !oldEndAt) { return; }
    const oldStartTime = oldStartAt.getTime();
    const oldEndTime = oldEndAt.getTime();

    // if start time is before end time, allow user to clear the error
    if (oldStartTime <= oldEndTime) {
      const newStartTime = newStartAt.getTime();
      const newEndAt = new Date(oldEndTime + (newStartTime - oldStartTime));
      dispatch(change(formName, endAtField, newEndAt));
    }
  };
}
