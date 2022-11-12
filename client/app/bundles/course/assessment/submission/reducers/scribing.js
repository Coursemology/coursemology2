import produce from 'immer';
import { isNumber } from 'lodash';

import actions, {
  canvasActionTypes,
  scribingShapes,
  scribingToolColor,
  scribingToolLineStyle,
  scribingTools,
  scribingToolThickness,
} from '../constants';

function initializeToolColor() {
  const colors = {};
  Object.values(scribingToolColor).forEach((toolType) => {
    colors[toolType] = 'rgba(0,0,0,1)';
  });
  return colors;
}

function initializeToolThickness() {
  const thickness = {};
  Object.values(scribingToolThickness).forEach((toolType) => {
    thickness[toolType] = 1;
  });
  return thickness;
}

function initializeLineStyles() {
  const lineStyles = {};
  Object.values(scribingToolLineStyle).forEach((toolType) => {
    lineStyles[toolType] = 'solid';
  });
  return lineStyles;
}

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FINALIZE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.FETCH_SUBMISSION_SUCCESS: {
      return {
        ...state,
        ...action.payload.answers.reduce(
          (obj, answer) => ({
            ...obj,
            [answer.fields.id]: {
              answer: { ...answer.scribing_answer },
              layers: [],
              selectedTool: scribingTools.SELECT,
              selectedShape: scribingShapes.RECT,
              imageWidth: 0,
              imageHeight: 0,
              fontFamily: 'Arial',
              fontSize: 23,
              colors: initializeToolColor(),
              lineStyles: initializeLineStyles(),
              thickness: initializeToolThickness(),
              hasNoFill: false,
              activeObject: undefined,
              isCanvasLoaded: false,
              isCanvasDirty: false,
              isDrawingMode: false,
              isChangeTool: false,
              isDelete: false,
              isUndo: false,
              isRedo: false,
              cursor: 'pointer',
              currentStateIndex: -1,
              canvasStates: [],
              canvasZoom: 1,
              canvasWidth: 100,
              canvasHeight: 100,
              canvasMaxWidth: 100,
              isLoading: false,
              isSaving: false,
              isSaved: false,
              hasError: false,
            },
          }),
          {},
        ),
      };
    }
    case actions.SET_CANVAS_LOADED: {
      const { answerId, loaded, canvas } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          canvas,
          isCanvasLoaded: loaded,
        },
      };
    }
    case actions.UPDATE_SCRIBING_ANSWER_REQUEST: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isLoading: true,
          isSaving: true,
          hasError: false,
        },
      };
    }
    case actions.UPDATE_SCRIBING_ANSWER_SUCCESS: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isSaving: false,
          isSaved: true,
          isLoading: false,
          hasError: false,
        },
      };
    }
    case actions.UPDATE_SCRIBING_ANSWER_FAILURE: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isSaving: false,
          isSaved: false,
          isLoading: false,
          hasError: true,
        },
      };
    }
    case actions.UPDATE_SCRIBING_ANSWER_IN_LOCAL: {
      const { answerId } = action.payload;
      const scribbles = [];

      // Modify existing scribbles if it exists
      if (state[answerId].answer.scribbles.length > 0) {
        state[answerId].answer.scribbles.forEach((scribble) => {
          scribbles.push({
            ...scribble,
            content:
              scribble.creator_id === state[answerId].answer.user_id
                ? action.payload.scribble
                : scribble.content,
          });
        });
      } else {
        scribbles.push({
          creator_id: state[answerId].answer.user_id,
          content: action.payload.scribble,
        });
      }

      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          answer: { ...state[answerId].answer, scribbles },
        },
      };
    }
    case canvasActionTypes.ADD_LAYER: {
      const { answerId, layer } = action.payload;
      const { layers } = state[answerId];
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          layers: [...layers, layer],
        },
      };
    }
    case canvasActionTypes.SET_LAYER_DISPLAY: {
      const { answerId, creatorId, isShown } = action.payload;
      const { layers } = state[answerId];
      layers.forEach((layer) => {
        if (layer.creator_id === creatorId) {
          // eslint-disable-next-line no-param-reassign
          layer.isDisplayed = isShown;
        }
      });

      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          layers,
        },
      };
    }
    case canvasActionTypes.SET_TOOL_SELECTED: {
      const { answerId, selectedTool } = action.payload;
      const isChangeTool = state.selectedTool !== selectedTool;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          selectedTool,
          isChangeTool,
        },
      };
    }
    case canvasActionTypes.SET_FONT_FAMILY: {
      const { answerId, fontFamily } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          fontFamily,
        },
      };
    }
    case canvasActionTypes.SET_FONT_SIZE: {
      const { answerId, fontSize } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          fontSize,
        },
      };
    }
    case canvasActionTypes.SET_LINE_STYLE_CHIP: {
      const { answerId, toolType, style } = action.payload;
      const { lineStyles } = state[answerId];
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          lineStyles: { ...lineStyles, [toolType]: style },
        },
      };
    }
    case canvasActionTypes.SET_COLORING_TOOL_COLOR: {
      const { answerId, coloringTool, color } = action.payload;
      const { colors } = state[answerId];
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          colors: { ...colors, [coloringTool]: color },
        },
      };
    }
    case canvasActionTypes.SET_TOOL_THICKNESS: {
      const { answerId, toolType, value } = action.payload;
      const { thickness } = state[answerId];
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          thickness: { ...thickness, [toolType]: value },
        },
      };
    }
    case canvasActionTypes.SET_SELECTED_SHAPE: {
      const { answerId, selectedShape } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          selectedShape,
        },
      };
    }
    case canvasActionTypes.SET_NO_FILL: {
      const { answerId, hasNoFill } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          hasNoFill,
        },
      };
    }
    case canvasActionTypes.SET_CANVAS_PROPERTIES: {
      const { answerId, canvasWidth, canvasHeight, canvasMaxWidth } =
        action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          canvasWidth,
          canvasHeight,
          canvasMaxWidth,
        },
      };
    }
    case canvasActionTypes.SET_DRAWING_MODE: {
      const { answerId, isDrawingMode } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isDrawingMode,
        },
      };
    }
    case canvasActionTypes.SET_CANVAS_CURSOR: {
      const { answerId, cursor } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          cursor,
        },
      };
    }
    case canvasActionTypes.SET_CURRENT_STATE_INDEX: {
      const { answerId, currentStateIndex } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          currentStateIndex,
        },
      };
    }
    case canvasActionTypes.SET_CANVAS_STATES: {
      const { answerId, canvasStates } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          canvasStates,
        },
      };
    }
    case canvasActionTypes.UPDATE_CANVAS_STATE: {
      const { answerId, canvasState } = action.payload;
      return produce(state, (draft) => {
        const currentState = draft[answerId];
        if (!currentState) throw new Error(`currentState is ${currentState}`);

        const currentStateIndex = currentState.currentStateIndex;
        if (!isNumber(currentStateIndex))
          throw new Error(`currentStateIndex is ${currentStateIndex}`);

        const canvasStates = currentState.canvasStates;
        if (!canvasStates)
          throw new Error(`canvasStates for ${answerId} is not init`);

        const lastIndex = canvasStates.length - 1;
        const nextIndex = currentStateIndex + 1;

        if (nextIndex <= lastIndex) canvasStates.splice(nextIndex);

        canvasStates.push(canvasState);

        const latestIndex = canvasStates.length - 1;
        currentState.currentStateIndex = latestIndex;

        if (latestIndex !== nextIndex)
          throw new Error(
            `canvasState index ${latestIndex} and nextIndex ${nextIndex} are different`,
          );
      });
    }
    case canvasActionTypes.SET_ACTIVE_OBJECT: {
      const { answerId, activeObject } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          activeObject,
        },
      };
    }
    case canvasActionTypes.SET_CANVAS_ZOOM: {
      const { answerId, canvasZoom } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          canvasZoom,
        },
      };
    }
    case canvasActionTypes.DELETE_CANVAS_OBJECT: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isDelete: true,
        },
      };
    }
    case canvasActionTypes.RESET_CANVAS_DELETE: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isDelete: false,
        },
      };
    }
    case canvasActionTypes.RESET_CHANGE_TOOL: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isChangeTool: false,
        },
      };
    }
    case canvasActionTypes.SET_DISABLE_OBJECT_SELECTION: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isDisableObjectSelection: true,
        },
      };
    }
    case canvasActionTypes.RESET_DISABLE_OBJECT_SELECTION: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isDisableObjectSelection: false,
        },
      };
    }
    case canvasActionTypes.SET_ENABLE_OBJECT_SELECTION: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isEnableObjectSelection: true,
        },
      };
    }
    case canvasActionTypes.RESET_ENABLE_OBJECT_SELECTION: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isEnableObjectSelection: false,
        },
      };
    }
    case canvasActionTypes.SET_CANVAS_DIRTY: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isCanvasDirty: true,
        },
      };
    }
    case canvasActionTypes.RESET_CANVAS_DIRTY: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isCanvasDirty: false,
        },
      };
    }
    case canvasActionTypes.SET_CANVAS_SAVE: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isCanvasSave: true,
        },
      };
    }
    case canvasActionTypes.RESET_CANVAS_SAVE: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isCanvasSave: false,
        },
      };
    }
    case canvasActionTypes.SET_UNDO: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isUndo: true,
        },
      };
    }
    case canvasActionTypes.RESET_UNDO: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isUndo: false,
        },
      };
    }
    case canvasActionTypes.SET_REDO: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isRedo: true,
        },
      };
    }
    case canvasActionTypes.RESET_REDO: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isRedo: false,
        },
      };
    }

    default: {
      return state;
    }
  }
}
