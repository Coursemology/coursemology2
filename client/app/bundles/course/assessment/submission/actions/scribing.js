import CourseAPI from 'api/course';

import actions, { canvasActionTypes } from '../constants';

export function setCanvasLoaded(answerId, loaded, canvas) {
  return (dispatch) =>
    dispatch({
      type: actions.SET_CANVAS_LOADED,
      payload: { answerId, loaded, canvas },
    });
}

export function updateScribingAnswer(
  answerId,
  answerActableId,
  scribblesInJSON,
) {
  const data = {
    content: scribblesInJSON,
    answer_id: answerActableId,
  };

  return (dispatch) => {
    dispatch({
      type: actions.UPDATE_SCRIBING_ANSWER_REQUEST,
      payload: { answerId },
    });

    return CourseAPI.assessment.answer.scribing
      .update(answerId, data)
      .then(() =>
        dispatch({
          type: actions.UPDATE_SCRIBING_ANSWER_SUCCESS,
          payload: { answerId },
        }),
      )
      .catch(() => {
        dispatch({
          type: actions.UPDATE_SCRIBING_ANSWER_FAILURE,
          payload: { answerId },
        });
      });
  };
}

export function updateScribingAnswerInLocal(answerId, scribblesInJSON) {
  return (dispatch) =>
    dispatch({
      type: actions.UPDATE_SCRIBING_ANSWER_IN_LOCAL,
      payload: {
        scribble: scribblesInJSON,
        answerId,
      },
    });
}

export function addLayer(answerId, layer) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.ADD_LAYER,
      payload: { answerId, layer },
    });
}

export function setLayerDisplay(answerId, creatorId, isShown) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_LAYER_DISPLAY,
      payload: { answerId, creatorId, isShown },
    });
}

export function setToolSelected(answerId, selectedTool) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_TOOL_SELECTED,
      payload: { answerId, selectedTool },
    });
}

export function setFontFamily(answerId, fontFamily) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_FONT_FAMILY,
      payload: { answerId, fontFamily },
    });
}

export function setFontSize(answerId, fontSize) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_FONT_SIZE,
      payload: { answerId, fontSize },
    });
}

export function setLineStyleChip(answerId, toolType, style) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_LINE_STYLE_CHIP,
      payload: { answerId, toolType, style },
    });
}

export function setColoringToolColor(answerId, coloringTool, color) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_COLORING_TOOL_COLOR,
      payload: { answerId, coloringTool, color },
    });
}

export function setToolThickness(answerId, toolType, value) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_TOOL_THICKNESS,
      payload: { answerId, toolType, value },
    });
}

export function setSelectedShape(answerId, selectedShape) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_SELECTED_SHAPE,
      payload: { answerId, selectedShape },
    });
}

export function setCanvasProperties(
  answerId,
  canvasWidth,
  canvasHeight,
  canvasMaxWidth,
) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_CANVAS_PROPERTIES,
      payload: { answerId, canvasWidth, canvasHeight, canvasMaxWidth },
    });
}

export function setDrawingMode(answerId, isDrawingMode) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_DRAWING_MODE,
      payload: { answerId, isDrawingMode },
    });
}

export function setNoFill(answerId, hasNoFill) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_NO_FILL,
      payload: { answerId, hasNoFill },
    });
}

export function setCanvasCursor(answerId, cursor) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_CANVAS_CURSOR,
      payload: { answerId, cursor },
    });
}

export function setCurrentStateIndex(answerId, currentStateIndex) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_CURRENT_STATE_INDEX,
      payload: { answerId, currentStateIndex },
    });
}

export function setCanvasStates(answerId, canvasStates) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_CANVAS_STATES,
      payload: { answerId, canvasStates },
    });
}

export function updateCanvasState(answerId, canvasState) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.UPDATE_CANVAS_STATE,
      payload: { answerId, canvasState },
    });
}

export function setActiveObject(answerId, activeObject) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_ACTIVE_OBJECT,
      payload: { answerId, activeObject },
    });
}

export function setCanvasZoom(answerId, canvasZoom) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_CANVAS_ZOOM,
      payload: { answerId, canvasZoom },
    });
}

export function resetChangeTool(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.RESET_CHANGE_TOOL,
      payload: { answerId },
    });
}

export function deleteCanvasObject(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.DELETE_CANVAS_OBJECT,
      payload: { answerId },
    });
}

export function resetCanvasDelete(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.RESET_CANVAS_DELETE,
      payload: { answerId },
    });
}

export function setDisableObjectSelection(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_DISABLE_OBJECT_SELECTION,
      payload: { answerId },
    });
}

export function resetDisableObjectSelection(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.RESET_DISABLE_OBJECT_SELECTION,
      payload: { answerId },
    });
}

export function setEnableObjectSelection(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_ENABLE_OBJECT_SELECTION,
      payload: { answerId },
    });
}

export function resetEnableObjectSelection(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.RESET_ENABLE_OBJECT_SELECTION,
      payload: { answerId },
    });
}

export function setCanvasDirty(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_CANVAS_DIRTY,
      payload: { answerId },
    });
}

export function resetCanvasDirty(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.RESET_CANVAS_DIRTY,
      payload: { answerId },
    });
}

export function setCanvasSave(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_CANVAS_SAVE,
      payload: { answerId },
    });
}

export function resetCanvasSave(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.RESET_CANVAS_SAVE,
      payload: { answerId },
    });
}

export function setUndo(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_UNDO,
      payload: { answerId },
    });
}

export function resetUndo(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.RESET_UNDO,
      payload: { answerId },
    });
}

export function setRedo(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.SET_REDO,
      payload: { answerId },
    });
}

export function resetRedo(answerId) {
  return (dispatch) =>
    dispatch({
      type: canvasActionTypes.RESET_REDO,
      payload: { answerId },
    });
}
