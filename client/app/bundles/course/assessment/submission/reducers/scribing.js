import actions, { canvasActionTypes, scribingTools, scribingShapes,
      scribingToolColor, scribingToolThickness, scribingToolLineStyle,
      scribingPopoverTypes } from '../constants';

function initializeToolColor() {
  const colors = {};
  Object.values(scribingToolColor).forEach(toolType =>
   (colors[toolType] = '#000000')
  );
  return colors;
}

function initializeToolThickness() {
  const thickness = {};
  Object.values(scribingToolThickness).forEach(toolType =>
   (thickness[toolType] = 1)
  );
  return thickness;
}

function initializeLineStyles() {
  const lineStyles = {};
  Object.values(scribingToolLineStyle).forEach(toolType =>
   (lineStyles[toolType] = 'solid')
  );
  return lineStyles;
}

function initializeColorDropdowns() {
  const colorDropdowns = {};
  Object.values(scribingToolColor).forEach(toolType =>
   (colorDropdowns[toolType] = false)
  );
  return colorDropdowns;
}

function initializePopovers() {
  const popovers = {};
  Object.values(scribingPopoverTypes).forEach(popoverType =>
   (popovers[popoverType] = false)
  );
  return popovers;
}

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS: {
      return {
        ...state,
        ...action.payload.answers.reduce((obj, answer) =>
          ({
            ...obj,
            [answer.fields.id]: {
              answer: { ...answer.scribing_answer },
              layers: [],
              selectedTool: scribingTools.SELECT,
              selectedShape: scribingShapes.RECT,
              hoveredToolTip: '',
              imageWidth: 0,
              imageHeight: 0,
              fontFamily: 'Arial',
              fontSize: 12,
              colors: initializeToolColor(),
              colorDropdowns: initializeColorDropdowns(),
              lineStyles: initializeLineStyles(),
              thickness: initializeToolThickness(),
              popovers: initializePopovers(),
              popoverAnchor: undefined,
              popoverColorPickerAnchor: undefined,
              isCanvasLoaded: false,
              isLoading: false,
              isSaving: false,
              isSaved: false,
              hasError: false,
            },
          })
        , {}),
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
    case actions.CLEAR_SAVING_STATUS: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          isSaving: false,
          isSaved: false,
          isLoading: false,
          hasError: false,
        },
      };
    }
    case actions.UPDATE_SCRIBING_ANSWER_IN_LOCAL: {
      const { answerId } = action.payload;
      const scribbles = [];
      state[answerId].answer.scribbles.forEach((scribble) => {
        scribbles.push({
          ...scribble,
          content: scribble.creator_id === state[answerId].answer.user_id ?
            action.payload.scribble : scribble.content,
        });
      });

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
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          selectedTool,
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
    case canvasActionTypes.OPEN_HOVER_TOOL_TIP: {
      const { answerId, hoveredToolTip } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          hoveredToolTip,
        },
      };
    }
    case canvasActionTypes.CLOSE_HOVER_TOOL_TIP: {
      const { answerId } = action.payload;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          hoveredToolTip: '',
        },
      };
    }
    case canvasActionTypes.OPEN_COLOR_PICKER: {
      const { answerId, toolType, popoverColorPickerAnchor } = action.payload;
      const { colorDropdowns } = state;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          colorDropdowns: { ...colorDropdowns, [toolType]: true },
          popoverColorPickerAnchor,
        },
      };
    }
    case canvasActionTypes.OPEN_POPOVER: {
      const { answerId, popoverType, popoverAnchor } = action.payload;
      const { popovers } = state;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          popovers: { ...popovers, [popoverType]: true },
          popoverAnchor,
        },
      };
    }
    case canvasActionTypes.CLOSE_COLOR_PICKER: {
      const { answerId, toolType } = action.payload;
      const { colorDropdowns } = state;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          colorDropdowns: { ...colorDropdowns, [toolType]: false },
        },
      };
    }
    case canvasActionTypes.CLOSE_POPOVER: {
      const { answerId, popoverType } = action.payload;
      const { popovers } = state;
      return {
        ...state,
        [answerId]: {
          ...state[answerId],
          popovers: { ...popovers, [popoverType]: false },
        },
      };
    }
    default: {
      return state;
    }
  }
}
