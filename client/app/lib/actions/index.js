import actionTypes from 'lib/constants';

export function setNotification(message) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.SET_NOTIFICATION,
      message,
    });
  };
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
