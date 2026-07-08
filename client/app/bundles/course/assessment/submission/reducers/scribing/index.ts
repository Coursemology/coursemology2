import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ScribingAnswerContent,
  ScribingAnswerData,
  ScribingAnswerScribble,
} from 'types/course/assessment/submission/answer/scribing';

import {
  SCRIBING_TOOLS_WITH_COLOR,
  SCRIBING_TOOLS_WITH_LINE_STYLE,
  SCRIBING_TOOLS_WITH_THICKNESS,
  ScribingShape,
  ScribingTool,
  ScribingToolWithColor,
  ScribingToolWithLineStyle,
  ScribingToolWithThickness,
} from '../../constants';

interface ScribingState {
  [answerId: number]: ScribingAnswerState;
}

export interface ScribingAnswerState {
  answer: ScribingAnswerContent;
  selectedTool: ScribingTool;
  selectedShape: ScribingShape;
  imageWidth: number;
  imageHeight: number;
  fontFamily: string;
  fontSize: number;
  colors: Record<ScribingToolWithColor, string>;
  lineStyles: Record<ScribingToolWithLineStyle, string>;
  thickness: Record<ScribingToolWithThickness, number>;
  hasNoFill: boolean;
  isCanvasLoaded: boolean;
  isCanvasDirty: boolean;
  isDrawingMode: boolean;
  isChangeTool: boolean;
  isDelete: boolean;
  isUndo: boolean;
  isRedo: boolean;
  cursor: string;
  currentStateIndex: number;
  canvasStates: string[];
  canvasZoom: number;
  canvasWidth: number;
  canvasHeight: number;
  canvasMaxWidth: number;
  isLoading: boolean;
  isSaving: boolean;
  isSaved: boolean;
  isDisableObjectSelection: boolean;
  isEnableObjectSelection: boolean;
  isCanvasSave: boolean;
  hasError: boolean;
}

function initializeToolColor(): Record<ScribingToolWithColor, string> {
  const colors = {};
  SCRIBING_TOOLS_WITH_COLOR.forEach((toolType) => {
    colors[toolType] = 'rgba(0,0,0,1)';
  });
  return colors as Record<ScribingToolWithColor, string>;
}

function initializeToolThickness(): Record<ScribingToolWithThickness, number> {
  const thickness = {};
  SCRIBING_TOOLS_WITH_THICKNESS.forEach((toolType) => {
    thickness[toolType] = 1;
  });
  return thickness as Record<ScribingToolWithThickness, number>;
}

function initializeLineStyles(): Record<ScribingToolWithLineStyle, string> {
  const lineStyles = {};
  SCRIBING_TOOLS_WITH_LINE_STYLE.forEach((toolType) => {
    lineStyles[toolType] = 'solid';
  });
  return lineStyles as Record<ScribingToolWithLineStyle, string>;
}

const initialState: ScribingState = {};

export const scribingSlice = createSlice({
  name: 'scribing',
  initialState,
  reducers: {
    initialize: (
      state,
      action: PayloadAction<{ answers: ScribingAnswerData[] }>,
    ) => {
      action.payload.answers.forEach((answer) => {
        state[answer.fields.id] = {
          answer: { ...answer.scribing_answer },
          selectedTool: 'SELECT',
          selectedShape: 'RECT',
          imageWidth: 0,
          imageHeight: 0,
          fontFamily: 'Arial',
          fontSize: 23,
          colors: initializeToolColor(),
          lineStyles: initializeLineStyles(),
          thickness: initializeToolThickness(),
          hasNoFill: false,
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
          isDisableObjectSelection: false,
          isEnableObjectSelection: false,
          isCanvasSave: false,
          hasError: false,
        };
      });
    },
    setCanvasLoaded: (
      state,
      action: PayloadAction<{ answerId: number; loaded: boolean }>,
    ) => {
      const { answerId, loaded } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isCanvasLoaded = loaded;
    },
    updateScribingAnswerRequest: (
      state,
      action: PayloadAction<{ answerId: number }>,
    ) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId] = {
        ...state[answerId],
        isLoading: true,
        isSaving: true,
        hasError: false,
      };
    },
    updateScribingAnswerSuccess: (
      state,
      action: PayloadAction<{ answerId: number }>,
    ) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId] = {
        ...state[answerId],
        isSaving: false,
        isSaved: true,
        isLoading: false,
        hasError: false,
      };
    },
    updateScribingAnswerFailure: (
      state,
      action: PayloadAction<{ answerId: number }>,
    ) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId] = {
        ...state[answerId],
        isSaving: false,
        isSaved: false,
        isLoading: false,
        hasError: true,
      };
    },
    updateScribingAnswerInLocal: (
      state,
      action: PayloadAction<{ answerId: number; scribble: string }>,
    ) => {
      const { answerId, scribble: newScribble } = action.payload;
      if (!state[answerId]) return;

      const scribbles: ScribingAnswerScribble[] = [];

      // Modify existing scribbles if it exists
      if (state[answerId].answer.scribbles.length > 0) {
        state[answerId].answer.scribbles.forEach((scribble) => {
          scribbles.push({
            ...scribble,
            content:
              scribble.creator_id === state[answerId].answer.user_id
                ? newScribble
                : scribble.content,
          });
        });
      } else {
        scribbles.push({
          creator_id: state[answerId].answer.user_id,
          content: newScribble,
        });
      }

      state[answerId].answer.scribbles = scribbles;
    },
    setToolSelected: (
      state,
      action: PayloadAction<{ answerId: number; selectedTool: ScribingTool }>,
    ) => {
      const { answerId, selectedTool } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isChangeTool =
        state[answerId].selectedTool !== selectedTool;
      state[answerId].selectedTool = selectedTool;
    },
    setFontFamily: (
      state,
      action: PayloadAction<{ answerId: number; fontFamily: string }>,
    ) => {
      const { answerId, fontFamily } = action.payload;
      if (!state[answerId]) return;

      state[answerId].fontFamily = fontFamily;
    },
    setFontSize: (
      state,
      action: PayloadAction<{ answerId: number; fontSize: number }>,
    ) => {
      const { answerId, fontSize } = action.payload;
      if (!state[answerId]) return;

      state[answerId].fontSize = fontSize;
    },
    setLineStyleChip: (
      state,
      action: PayloadAction<{
        answerId: number;
        toolType: ScribingToolWithLineStyle;
        style: string;
      }>,
    ) => {
      const { answerId, toolType, style } = action.payload;
      if (!state[answerId]) return;

      state[answerId].lineStyles[toolType] = style;
    },
    setColoringToolColor: (
      state,
      action: PayloadAction<{
        answerId: number;
        coloringTool: ScribingToolWithColor;
        color: string;
      }>,
    ) => {
      const { answerId, coloringTool, color } = action.payload;
      if (!state[answerId]) return;

      state[answerId].colors[coloringTool] = color;
    },
    setToolThickness: (
      state,
      action: PayloadAction<{
        answerId: number;
        toolType: ScribingToolWithThickness;
        value: number;
      }>,
    ) => {
      const { answerId, toolType, value } = action.payload;
      if (!state[answerId]) return;

      state[answerId].thickness[toolType] = value;
    },
    setSelectedShape: (
      state,
      action: PayloadAction<{ answerId: number; selectedShape: ScribingShape }>,
    ) => {
      const { answerId, selectedShape } = action.payload;
      if (!state[answerId]) return;

      state[answerId].selectedShape = selectedShape;
    },
    setNoFill: (
      state,
      action: PayloadAction<{ answerId: number; hasNoFill: boolean }>,
    ) => {
      const { answerId, hasNoFill } = action.payload;
      if (!state[answerId]) return;

      state[answerId].hasNoFill = hasNoFill;
    },
    setCanvasProperties: (
      state,
      action: PayloadAction<{
        answerId: number;
        canvasWidth: number;
        canvasHeight: number;
        canvasMaxWidth: number;
      }>,
    ) => {
      const { answerId, canvasWidth, canvasHeight, canvasMaxWidth } =
        action.payload;
      if (!state[answerId]) return;

      state[answerId] = {
        ...state[answerId],
        canvasWidth,
        canvasHeight,
        canvasMaxWidth,
      };
    },
    setDrawingMode: (
      state,
      action: PayloadAction<{ answerId: number; isDrawingMode: boolean }>,
    ) => {
      const { answerId, isDrawingMode } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isDrawingMode = isDrawingMode;
    },
    setCanvasCursor: (
      state,
      action: PayloadAction<{ answerId: number; cursor: string }>,
    ) => {
      const { answerId, cursor } = action.payload;
      if (!state[answerId]) return;

      state[answerId].cursor = cursor;
    },
    setCurrentStateIndex: (
      state,
      action: PayloadAction<{ answerId: number; currentStateIndex: number }>,
    ) => {
      const { answerId, currentStateIndex } = action.payload;
      if (!state[answerId]) return;

      state[answerId].currentStateIndex = currentStateIndex;
    },
    setCanvasStates: (
      state,
      action: PayloadAction<{ answerId: number; canvasStates: string[] }>,
    ) => {
      const { answerId, canvasStates } = action.payload;
      if (!state[answerId]) return;

      state[answerId].canvasStates = canvasStates;
    },
    updateCanvasState: (
      state,
      action: PayloadAction<{ answerId: number; canvasState: string }>,
    ) => {
      const { answerId, canvasState } = action.payload;
      if (!state[answerId]) return;

      const currentState = state[answerId];

      const currentStateIndex = currentState.currentStateIndex;

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
    },
    setCanvasZoom: (
      state,
      action: PayloadAction<{ answerId: number; canvasZoom: number }>,
    ) => {
      const { answerId, canvasZoom } = action.payload;
      if (!state[answerId]) return;

      state[answerId].canvasZoom = canvasZoom;
    },
    deleteCanvasObject: (
      state,
      action: PayloadAction<{ answerId: number }>,
    ) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isDelete = true;
    },
    resetCanvasDelete: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isDelete = false;
    },
    resetChangeTool: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isChangeTool = false;
    },
    setDisableObjectSelection: (
      state,
      action: PayloadAction<{ answerId: number }>,
    ) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isDisableObjectSelection = true;
    },
    resetDisableObjectSelection: (
      state,
      action: PayloadAction<{ answerId: number }>,
    ) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isDisableObjectSelection = false;
    },
    setEnableObjectSelection: (
      state,
      action: PayloadAction<{ answerId: number }>,
    ) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isEnableObjectSelection = true;
    },
    resetEnableObjectSelection: (
      state,
      action: PayloadAction<{ answerId: number }>,
    ) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isEnableObjectSelection = false;
    },
    setCanvasDirty: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isCanvasDirty = true;
    },
    resetCanvasDirty: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isCanvasDirty = false;
    },
    setCanvasSave: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isCanvasSave = true;
    },
    resetCanvasSave: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isCanvasSave = false;
    },
    setUndo: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isUndo = true;
    },
    resetUndo: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isUndo = false;
    },
    setRedo: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isRedo = true;
    },
    resetRedo: (state, action: PayloadAction<{ answerId: number }>) => {
      const { answerId } = action.payload;
      if (!state[answerId]) return;

      state[answerId].isRedo = false;
    },
  },
});

export const scribingActions = scribingSlice.actions;

export default scribingSlice.reducer;
