import CourseAPI from 'api/course';
import { SubmissionError } from 'redux-form';
import actions, { canvasActionTypes } from '../constants';

export function setCanvasLoaded(answerId, loaded, canvas) {
  return dispatch => (
    dispatch({
      type: actions.SET_CANVAS_LOADED,
      payload: { answerId, loaded, canvas },
    })
  );
}

export function clearSavingStatus(answerId) {
  return dispatch => (
    dispatch({
      type: actions.CLEAR_SAVING_STATUS,
      payload: { answerId },
    })
  );
}

export function updateScribingAnswer(answerId, answerActableId, scribblesInJSON) {
  const data = {
    content: scribblesInJSON,
    answer_id: answerActableId,
  };

  return (dispatch) => {
    dispatch({
      type: actions.UPDATE_SCRIBING_ANSWER_REQUEST,
      payload: { answerId },
    });

    return CourseAPI.assessment.answer.scribing.update(answerId, data)
    .then(() => (
      dispatch({
        type: actions.UPDATE_SCRIBING_ANSWER_SUCCESS,
        payload: { answerId },
      })
    ))
    .catch((error) => {
      dispatch({
        type: actions.UPDATE_SCRIBING_ANSWER_FAILURE,
        payload: { answerId },
      });
      if (error.response && error.response.data) {
        throw new SubmissionError(error.response.data.errors);
      }
    });
  };
}

export function updateScribingAnswerInLocal(answerId, scribblesInJSON) {
  return dispatch => (
    dispatch({
      type: actions.UPDATE_SCRIBING_ANSWER_IN_LOCAL,
      payload: {
        scribble: scribblesInJSON,
        answerId,
      },
    })
  );
}

export function addLayer(answerId, layer) {
  return dispatch => (
    dispatch({
      type: canvasActionTypes.ADD_LAYER,
      payload: { answerId, layer },
    })
  );
}

export function setLayerDisplay(answerId, creatorId, isShown) {
  return dispatch => (
    dispatch({
      type: canvasActionTypes.SET_LAYER_DISPLAY,
      payload: { answerId, creatorId, isShown },
    })
  );
}

export function setToolSelected(answerId, selectedTool) {
  return dispatch => (
    dispatch({
      type: canvasActionTypes.SET_TOOL_SELECTED,
      payload: { answerId, selectedTool },
    })
  );
}

export function setFontFamily(answerId, fontFamily) {
  return dispatch => (
    dispatch({
      type: canvasActionTypes.SET_FONT_FAMILY,
      payload: { answerId, fontFamily },
    })
  );
}

export function setFontSize(answerId, fontSize) {
  return dispatch => (
    dispatch({
      type: canvasActionTypes.SET_FONT_SIZE,
      payload: { answerId, fontSize },
    })
  );
}

export function setLineStyleChip(answerId, toolType, style) {
  return dispatch => (
    dispatch({
      type: canvasActionTypes.SET_LINE_STYLE_CHIP,
      payload: { answerId, toolType, style },
    })
  );
}

export function setColoringToolColor(answerId, coloringTool, color) {
  return dispatch => (
    dispatch({
      type: canvasActionTypes.SET_COLORING_TOOL_COLOR,
      payload: { answerId, coloringTool, color },
    })
  );
}

export function setToolThickness(answerId, toolType, value) {
  return dispatch => (
    dispatch({
      type: canvasActionTypes.SET_TOOL_THICKNESS,
      payload: { answerId, toolType, value },
    })
  );
}

export function setSelectedShape(answerId, selectedShape) {
  return dispatch => (
    dispatch({
      type: canvasActionTypes.SET_SELECTED_SHAPE,
      payload: { answerId, selectedShape },
    })
  );
}
