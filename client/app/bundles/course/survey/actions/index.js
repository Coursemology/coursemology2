import actionTypes from '../constants';

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

export function setNotification(message) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_SURVEY_NOTIFICATION,
      message,
    });
  };
}
