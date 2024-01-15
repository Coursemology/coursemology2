import actionTypes from '../../constants';

export function setRecording(payload = {}) {
  const { recordingComponentId } = payload;
  return (dispatch) =>
    dispatch({
      type: actionTypes.RECORDER_SET_RECORDING,
      payload: { recordingComponentId },
    });
}

export function setNotRecording() {
  return (dispatch) => dispatch({ type: actionTypes.RECORDER_SET_UNRECORDING });
}

export function recorderComponentMount() {
  return (dispatch) => dispatch({ type: actionTypes.RECORDER_COMPONENT_MOUNT });
}

export function recorderComponentUnmount() {
  return (dispatch) =>
    dispatch({ type: actionTypes.RECORDER_COMPONENT_UNMOUNT });
}
