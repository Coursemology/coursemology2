import {
  CSSProperties,
  FC,
  MouseEvent,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { FormattedMessage } from 'react-intl';
import {
  CreateOutlined,
  CropSquareRounded,
  Delete,
  FontDownloadOutlined,
  HorizontalRule,
  OpenWithOutlined,
  RadioButtonUncheckedRounded,
  Redo,
  Undo,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import { IconButton, SelectChangeEvent, Tooltip } from '@mui/material';
import { blue, grey } from '@mui/material/colors';
import { Ellipse, IText, Line, Path, Rect } from 'fabric';

import SavingIndicator from 'lib/components/core/indicators/SavingIndicator';
import PointerIcon from 'lib/components/icons/PointerIcon';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import {
  SCRIBING_POPOVER_TYPES,
  SCRIBING_TOOLS_WITH_COLOR,
  ScribingPopoverType,
  ScribingShape,
  ScribingToolWithColor,
  ScribingToolWithLineStyle,
} from '../../constants';
import { scribingActions } from '../../reducers/scribing';
import { scribingTranslations as translations } from '../../translations';

import DrawPopover from './popovers/DrawPopover';
import LinePopover from './popovers/LinePopover';
import ShapePopover from './popovers/ShapePopover';
import TypePopover from './popovers/TypePopover';
import LayersComponent from './LayersComponent';
import { ScribingCanvasRef, ScribingLayer } from './ScribingCanvas';
import ToolDropdown from './ToolDropdown';

const styles: Record<string, CSSProperties> = {
  toolbar: {
    marginRight: '0.5em',
  },
  disabledToolbar: {
    cursor: 'not-allowed',
    pointerEvents: 'none',
    opacity: '0.15',
    filter: 'alpha(opacity=65)',
    boxShadow: 'none',
    marginBottom: '1em',
  },
  tool: {
    paddingLeft: '8px',
    paddingBottom: '8px',
  },
  disabled: {
    cursor: 'not-allowed',
    pointerEvents: 'none',
    color: '#c0c0c0',
  },
};

function initializeColorDropdowns(): Record<ScribingToolWithColor, boolean> {
  const colorDropdowns = {};
  SCRIBING_TOOLS_WITH_COLOR.forEach((toolType) => {
    colorDropdowns[toolType] = false;
  });
  return colorDropdowns as Record<ScribingToolWithColor, boolean>;
}

function initializePopovers(): Record<ScribingPopoverType, boolean> {
  const popovers = {};
  SCRIBING_POPOVER_TYPES.forEach((popoverType) => {
    popovers[popoverType] = false;
  });
  return popovers as Record<ScribingPopoverType, boolean>;
}

interface ScribingToolbarProps {
  answerId: number;
  canvasRef?: ScribingCanvasRef | null;
}

const ScribingToolbar: FC<ScribingToolbarProps> = ({ answerId, canvasRef }) => {
  const scribings = useAppSelector(
    (state) => state.assessments.submission.scribing,
  );
  const scribing = scribings[answerId];
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const [colorDropdowns, setColorDropdowns] = useState(
    initializeColorDropdowns(),
  );
  const [popoverColorPickerAnchor, setPopoverColorPickerAnchor] =
    useState<HTMLElement | null>(null);
  const [popovers, setPopovers] = useState(initializePopovers());
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => canvasRef?.onSelectionChange(forceUpdate), [canvasRef]);

  if (!scribing || !canvasRef) {
    return null;
  }

  const activeObject = canvasRef?.getActiveObject();
  const layers = canvasRef?.getLayers() ?? [];

  // Toolbar Event handlers

  const onChangeCompleteColor = (
    color: string,
    coloringTool: ScribingToolWithColor,
  ): void => {
    dispatch(
      scribingActions.setColoringToolColor({ answerId, coloringTool, color }),
    );
  };

  const onChangeFontFamily = (event: SelectChangeEvent<string>): void => {
    dispatch(
      scribingActions.setFontFamily({
        answerId,
        fontFamily: event.target.value,
      }),
    );
  };

  const onChangeFontSize = (event: SelectChangeEvent<number>): void => {
    dispatch(
      scribingActions.setFontSize({
        answerId,
        fontSize: event.target.value as number,
      }),
    );
  };

  const onChangeSliderThickness = (event, toolType, value): void => {
    dispatch(
      scribingActions.setToolThickness({
        answerId,
        toolType,
        value,
      }),
    );
  };

  const onClickColorPicker = (
    event: MouseEvent<HTMLElement>,
    toolType: ScribingToolWithColor,
  ): void => {
    setColorDropdowns({
      ...colorDropdowns,
      [toolType]: true,
    });
    setPopoverColorPickerAnchor(event.currentTarget);
  };

  const onClickDelete = (): void => {
    dispatch(scribingActions.deleteCanvasObject({ answerId }));
  };

  const onClickDrawingMode = (): void => {
    dispatch(
      scribingActions.setToolSelected({
        answerId,
        selectedTool: 'DRAW',
      }),
    );
    // isDrawingMode automatically disables selection mode in fabric.js
    dispatch(scribingActions.setDrawingMode({ answerId, isDrawingMode: true }));
  };

  const onClickLineMode = (): void => {
    dispatch(
      scribingActions.setToolSelected({ answerId, selectedTool: 'LINE' }),
    );
    dispatch(
      scribingActions.setDrawingMode({ answerId, isDrawingMode: false }),
    );
    dispatch(
      scribingActions.setCanvasCursor({ answerId, cursor: 'crosshair' }),
    );
    dispatch(scribingActions.setDisableObjectSelection({ answerId }));
  };

  const onClickLineStyleChip = (
    event: MouseEvent<HTMLElement>,
    toolType: ScribingToolWithLineStyle,
    style: string,
  ): void => {
    // This prevents ghost click.
    event.preventDefault();
    dispatch(scribingActions.setLineStyleChip({ answerId, toolType, style }));
  };

  const onClickMoveMode = (): void => {
    dispatch(
      scribingActions.setToolSelected({ answerId, selectedTool: 'MOVE' }),
    );
    dispatch(
      scribingActions.setDrawingMode({ answerId, isDrawingMode: false }),
    );
    dispatch(scribingActions.setCanvasCursor({ answerId, cursor: 'move' }));
    dispatch(scribingActions.setDisableObjectSelection({ answerId }));
  };

  const onClickPopover = (
    event: MouseEvent<HTMLElement>,
    popoverType: ScribingPopoverType,
  ): void => {
    const newPopoverAnchor =
      popoverType === 'LAYER'
        ? event.currentTarget
        : event.currentTarget?.parentElement?.parentElement;
    setPopovers({
      ...popovers,
      [popoverType]: true,
    });
    setPopoverAnchor(newPopoverAnchor ?? null);
  };

  const onClickRedo = (): void => {
    dispatch(scribingActions.setRedo({ answerId }));
  };

  const onClickSelectionMode = (): void => {
    dispatch(
      scribingActions.setToolSelected({ answerId, selectedTool: 'SELECT' }),
    );
    dispatch(
      scribingActions.setDrawingMode({ answerId, isDrawingMode: false }),
    );
    dispatch(scribingActions.setCanvasCursor({ answerId, cursor: 'default' }));
    dispatch(scribingActions.setEnableObjectSelection({ answerId }));
  };

  const onClickShapeMode = (): void => {
    dispatch(
      scribingActions.setToolSelected({ answerId, selectedTool: 'SHAPE' }),
    );
    dispatch(
      scribingActions.setDrawingMode({ answerId, isDrawingMode: false }),
    );
    dispatch(
      scribingActions.setCanvasCursor({ answerId, cursor: 'crosshair' }),
    );
    dispatch(scribingActions.setDisableObjectSelection({ answerId }));
  };

  const onClickTypingMode = (): void => {
    dispatch(
      scribingActions.setToolSelected({ answerId, selectedTool: 'TYPE' }),
    );
    dispatch(
      scribingActions.setDrawingMode({ answerId, isDrawingMode: false }),
    );
    dispatch(scribingActions.setCanvasCursor({ answerId, cursor: 'text' }));
  };

  const onClickTypingChevron = (event: MouseEvent<HTMLElement>): void => {
    onClickTypingMode();
    onClickPopover(event, 'TYPE');
  };

  const onClickTypingIcon = (): void => {
    onClickTypingMode();
  };

  const onClickUndo = (): void => {
    dispatch(scribingActions.setUndo({ answerId }));
  };

  const onClickZoomIn = (): void => {
    const newZoom = scribing.canvasZoom + 0.1;
    dispatch(scribingActions.setCanvasZoom({ answerId, canvasZoom: newZoom }));
  };

  const onClickZoomOut = (): void => {
    const newZoom = Math.max(scribing.canvasZoom - 0.1, 1);
    dispatch(scribingActions.setCanvasZoom({ answerId, canvasZoom: newZoom }));
  };

  const onRequestCloseColorPicker = (toolType: ScribingToolWithColor): void => {
    setColorDropdowns({
      ...colorDropdowns,
      [toolType]: false,
    });
  };

  const onRequestClosePopover = (popoverType: ScribingPopoverType): void => {
    setPopovers({
      ...popovers,
      [popoverType]: false,
    });
  };

  const getActiveObjectSelectedLineStyle = (): string => {
    if (!activeObject?.strokeDashArray) {
      return 'solid';
    }

    let lineStyle;
    if (
      activeObject.strokeDashArray[0] === 1 &&
      activeObject.strokeDashArray[1] === 3
    ) {
      lineStyle = 'dotted';
    } else if (
      activeObject.strokeDashArray[0] === 10 &&
      activeObject.strokeDashArray[1] === 5
    ) {
      lineStyle = 'dashed';
    } else {
      lineStyle = 'solid';
    }
    return lineStyle;
  };

  const getSavingStatus = (): 'None' | 'Saving' | 'Saved' | 'Failed' => {
    if (scribing.isSaving) {
      return 'Saving';
    }
    if (scribing.isSaved) {
      return 'Saved';
    }
    if (scribing.hasError) {
      return 'Failed';
    }
    return 'None';
  };

  // Helpers

  const setSelectedShape = (shape: ScribingShape): void => {
    dispatch(
      scribingActions.setSelectedShape({ answerId, selectedShape: shape }),
    );
  };

  const setToSelectTool = (): void => {
    dispatch(
      scribingActions.setToolSelected({ answerId, selectedTool: 'SELECT' }),
    );
    dispatch(scribingActions.setCanvasCursor({ answerId, cursor: 'default' }));
    dispatch(scribingActions.setEnableObjectSelection({ answerId }));
    dispatch(
      scribingActions.setDrawingMode({ answerId, isDrawingMode: false }),
    );
  };

  const toolBarStyle = !scribing.isCanvasLoaded
    ? styles.disabledToolbar
    : styles.toolbar;
  const isNewRect = scribing.selectedShape === 'RECT';
  const isEditRect = activeObject && activeObject instanceof Rect;
  const shapeIcon =
    isNewRect || isEditRect ? CropSquareRounded : RadioButtonUncheckedRounded;

  const typePopoverProps = {
    open: popovers.TYPE,
    anchorEl: popoverAnchor,
    onClickColorPicker: (event) => onClickColorPicker(event, 'TYPE'),
    colorPickerPopoverOpen: colorDropdowns.TYPE,
    colorPickerPopoverAnchorEl: popoverColorPickerAnchor,
    onRequestCloseColorPickerPopover: () => onRequestCloseColorPicker('TYPE'),
  };

  const drawPopoverProps = {
    open: popovers.DRAW,
    anchorEl: popoverAnchor,
    onClickColorPicker: (event) => onClickColorPicker(event, 'DRAW'),
    colorPickerPopoverOpen: colorDropdowns.DRAW,
    colorPickerPopoverAnchorEl: popoverColorPickerAnchor,
    onRequestCloseColorPickerPopover: () => onRequestCloseColorPicker('DRAW'),
  };

  const linePopoverProps = {
    lineToolType: 'LINE',
    open: popovers.LINE,
    anchorEl: popoverAnchor,
    colorPickerPopoverOpen: colorDropdowns.LINE,
    colorPickerPopoverAnchorEl: popoverColorPickerAnchor,
    onRequestCloseColorPickerPopover: () => onRequestCloseColorPicker('LINE'),
  };

  const shapePopoverProps = {
    lineToolType: 'SHAPE_BORDER',
    open: popovers.SHAPE,
    anchorEl: popoverAnchor,
    currentShape: scribing.selectedShape,
    setSelectedShape: (shape) => setSelectedShape(shape),
    onClickBorderColorPicker: (event) =>
      onClickColorPicker(event, 'SHAPE_BORDER'),
    borderColorPickerPopoverOpen: colorDropdowns.SHAPE_BORDER,
    borderColorPickerPopoverAnchorEl: popoverColorPickerAnchor,
    onRequestCloseBorderColorPickerPopover: () =>
      onRequestCloseColorPicker('SHAPE_BORDER'),
    onClickFillColorPicker: (event) => onClickColorPicker(event, 'SHAPE_FILL'),
    fillColorPickerPopoverOpen: colorDropdowns.SHAPE_FILL,
    fillColorPickerPopoverAnchorEl: popoverColorPickerAnchor,
    noFillValue: scribing.hasNoFill,
    noFillOnCheck: (checked) =>
      dispatch(scribingActions.setNoFill({ answerId, hasNoFill: checked })),
    onRequestCloseFillColorPickerPopover: () =>
      onRequestCloseColorPicker('SHAPE_FILL'),
  };

  return (
    <div
      style={{
        ...toolBarStyle,
        backgroundColor: grey[200],
        height: 56,
        width: '100%',
        minWidth: 800,
        display: 'flex',
        justifyContent: 'space-between',
        paddingLeft: '0.5em',
        paddingRight: '0.5em',
      }}
    >
      <div className="flex items-center">
        <ToolDropdown
          activeObject={activeObject}
          colorBarBackground={scribing.colors.TYPE}
          currentTool={scribing.selectedTool}
          disabled={(activeObject && !(activeObject instanceof IText)) || false}
          iconComponent={FontDownloadOutlined}
          onClickChevron={onClickTypingChevron}
          onClickIcon={onClickTypingIcon}
          tooltip={t(translations.text)}
          toolType="TYPE"
        />
        {activeObject && activeObject instanceof IText ? (
          <TypePopover
            {...typePopoverProps}
            colorPickerColor={activeObject.fill}
            fontFamilyValue={activeObject.fontFamily}
            fontSizeValue={activeObject.fontSize}
            onChangeCompleteColorPicker={(color) => {
              activeObject?.set({ fill: color });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
              onRequestCloseColorPicker('TYPE');
            }}
            onChangeFontFamily={(event) => {
              activeObject?.set({ fontFamily: event.target.value });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
            }}
            onChangeFontSize={(event) => {
              activeObject?.set({ fontSize: event.target.value });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
            }}
            onRequestClose={(): void => {
              dispatch(scribingActions.setCanvasSave({ answerId }));
              setToSelectTool();
              onRequestClosePopover('TYPE');
            }}
          />
        ) : (
          <TypePopover
            {...typePopoverProps}
            colorPickerColor={scribing.colors.TYPE}
            fontFamilyValue={scribing.fontFamily}
            fontSizeValue={scribing.fontSize}
            onChangeCompleteColorPicker={(color) =>
              onChangeCompleteColor(color, 'TYPE')
            }
            onChangeFontFamily={onChangeFontFamily}
            onChangeFontSize={onChangeFontSize}
            onRequestClose={() => onRequestClosePopover('TYPE')}
          />
        )}
        <ToolDropdown
          activeObject={activeObject}
          colorBarBackground={scribing.colors.DRAW}
          currentTool={scribing.selectedTool}
          disabled={(activeObject && !(activeObject instanceof Path)) || false}
          iconComponent={CreateOutlined}
          onClick={onClickDrawingMode}
          onClickChevron={(event) => onClickPopover(event, 'DRAW')}
          tooltip={<FormattedMessage {...translations.pencil} />}
          toolType="DRAW"
        />
        {activeObject && activeObject instanceof Path ? (
          <DrawPopover
            {...drawPopoverProps}
            colorPickerColor={activeObject.stroke}
            onChangeCompleteColorPicker={(color) => {
              activeObject?.set({ stroke: color });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
              onRequestCloseColorPicker('DRAW');
            }}
            onChangeSliderThickness={(event, newValue) => {
              activeObject?.set({ strokeWidth: newValue });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
            }}
            onRequestClose={(): void => {
              dispatch(scribingActions.setCanvasSave({ answerId }));
              setToSelectTool();
              onRequestClosePopover('DRAW');
            }}
            toolThicknessValue={activeObject.strokeWidth}
          />
        ) : (
          <DrawPopover
            {...drawPopoverProps}
            colorPickerColor={scribing.colors.DRAW}
            onChangeCompleteColorPicker={(color) =>
              onChangeCompleteColor(color, 'DRAW')
            }
            onChangeSliderThickness={(event, newValue) =>
              onChangeSliderThickness(event, 'DRAW', newValue)
            }
            onRequestClose={() => onRequestClosePopover('DRAW')}
            toolThicknessValue={scribing.thickness.DRAW}
          />
        )}

        <ToolDropdown
          activeObject={activeObject}
          colorBarBackground={scribing.colors.LINE}
          currentTool={scribing.selectedTool}
          disabled={(activeObject && !(activeObject instanceof Line)) || false}
          iconComponent={HorizontalRule}
          onClick={onClickLineMode}
          onClickChevron={(event) => onClickPopover(event, 'LINE')}
          tooltip={t(translations.line)}
          toolType="LINE"
        />
        {activeObject && activeObject instanceof Line ? (
          <LinePopover
            {...linePopoverProps}
            colorPickerColor={activeObject.stroke}
            onChangeCompleteColorPicker={(color) => {
              activeObject?.set({ stroke: color });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
              onRequestCloseColorPicker('LINE');
            }}
            onChangeSliderThickness={(event, newValue) => {
              activeObject?.set({ strokeWidth: newValue });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
            }}
            onClickColorPicker={(event) => onClickColorPicker(event, 'LINE')}
            onClickLineStyleChip={(_, __, style) => {
              let strokeDashArray: number[] = [];
              if (style === 'dotted') {
                strokeDashArray = [1, 3];
              } else if (style === 'dashed') {
                strokeDashArray = [10, 5];
              }
              activeObject?.set({ strokeDashArray });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
            }}
            onRequestClose={(): void => {
              dispatch(scribingActions.setCanvasSave({ answerId }));
              setToSelectTool();
              onRequestClosePopover('LINE');
            }}
            selectedLineStyle={getActiveObjectSelectedLineStyle()}
            toolThicknessValue={activeObject.strokeWidth}
          />
        ) : (
          <LinePopover
            {...linePopoverProps}
            colorPickerColor={scribing.colors.LINE}
            onChangeCompleteColorPicker={(color) =>
              onChangeCompleteColor(color, 'LINE')
            }
            onChangeSliderThickness={(event, newValue) =>
              onChangeSliderThickness(event, 'LINE', newValue)
            }
            onClickColorPicker={(event) => onClickColorPicker(event, 'LINE')}
            onClickLineStyleChip={onClickLineStyleChip}
            onRequestClose={() => onRequestClosePopover('LINE')}
            selectedLineStyle={scribing.lineStyles.LINE}
            toolThicknessValue={scribing.thickness.LINE}
          />
        )}

        <ToolDropdown
          activeObject={activeObject}
          colorBarBackground={scribing.colors.SHAPE_FILL}
          colorBarBorder={scribing.colors.SHAPE_BORDER}
          currentTool={scribing.selectedTool}
          disabled={
            (activeObject &&
              !(activeObject instanceof Rect) &&
              !(activeObject instanceof Ellipse)) ||
            false
          }
          iconComponent={shapeIcon}
          onClick={onClickShapeMode}
          onClickChevron={(event) => onClickPopover(event, 'SHAPE')}
          tooltip={t(translations.shape)}
          toolType="SHAPE"
        />
        {activeObject &&
        (activeObject instanceof Rect || activeObject instanceof Ellipse) ? (
          <ShapePopover
            {...shapePopoverProps}
            borderColorPickerColor={activeObject.stroke}
            displayShapeField={false}
            fillColorPickerColor={activeObject.fill}
            noFillValue={
              typeof activeObject.fill === 'string' &&
              /^rgba\(\d+,\d+,\d+,0\)$/.test(activeObject.fill)
            }
            onChangeCompleteBorderColorPicker={(color) => {
              activeObject?.set({ stroke: color });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
              onRequestCloseColorPicker('SHAPE_BORDER');
            }}
            onChangeCompleteFillColorPicker={(color) => {
              activeObject?.set({ fill: color });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
              onRequestCloseColorPicker('SHAPE_FILL');
            }}
            onChangeSliderThickness={(event, newValue) => {
              activeObject?.set({ strokeWidth: newValue });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
            }}
            onClickLineStyleChip={(_, __, style) => {
              let strokeDashArray: number[] = [];
              if (style === 'dotted') {
                strokeDashArray = [1, 3];
              } else if (style === 'dashed') {
                strokeDashArray = [10, 5];
              }
              activeObject?.set({ strokeDashArray });
              dispatch(scribingActions.setCanvasDirty({ answerId }));
            }}
            onRequestClose={(): void => {
              dispatch(scribingActions.setCanvasSave({ answerId }));
              setToSelectTool();
              onRequestClosePopover('SHAPE');
              dispatch(
                scribingActions.setNoFill({ answerId, hasNoFill: false }),
              );
            }}
            selectedLineStyle={getActiveObjectSelectedLineStyle()}
            toolThicknessValue={activeObject.strokeWidth}
          />
        ) : (
          <ShapePopover
            {...shapePopoverProps}
            borderColorPickerColor={scribing.colors.SHAPE_BORDER}
            displayShapeField
            fillColorPickerColor={scribing.colors.SHAPE_FILL}
            onChangeCompleteBorderColorPicker={(color) =>
              onChangeCompleteColor(color, 'SHAPE_BORDER')
            }
            onChangeCompleteFillColorPicker={(color) =>
              onChangeCompleteColor(color, 'SHAPE_FILL')
            }
            onChangeSliderThickness={(event, newValue) =>
              onChangeSliderThickness(event, 'SHAPE_BORDER', newValue)
            }
            onClickLineStyleChip={onClickLineStyleChip}
            onRequestClose={(): void => {
              onRequestClosePopover('SHAPE');
              dispatch(
                scribingActions.setNoFill({ answerId, hasNoFill: false }),
              );
            }}
            selectedLineStyle={scribing.lineStyles.SHAPE_BORDER}
            toolThicknessValue={scribing.thickness.SHAPE_BORDER}
          />
        )}
      </div>
      <div className="flex flex-shrink items-center">
        <LayersComponent
          anchorEl={popoverAnchor}
          disabled={layers.length === 0}
          layers={layers}
          onClick={(event) => onClickPopover(event, 'LAYER')}
          onClickLayer={(layer: ScribingLayer) => {
            canvasRef?.setLayerDisplay(layer.creator_id, !layer.isDisplayed);
            forceUpdate();
          }}
          onRequestClose={() => onRequestClosePopover('LAYER')}
          open={popovers.LAYER}
        />
      </div>
      <div className="flex items-center -space-x-1">
        <Tooltip
          placement="top"
          title={<FormattedMessage {...translations.select} />}
        >
          <IconButton
            className="pb-6 pl-8 pt-8"
            color={scribing.selectedTool === 'SELECT' ? 'primary' : undefined}
            onClick={onClickSelectionMode}
          >
            <PointerIcon />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={t(translations.undo)}>
          <IconButton
            onClick={onClickUndo}
            style={
              scribing.currentStateIndex < 1
                ? { ...styles.disabled, ...styles.tool }
                : styles.tool
            }
          >
            <Undo />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={t(translations.redo)}>
          <IconButton
            onClick={onClickRedo}
            style={
              scribing.currentStateIndex >= scribing.canvasStates.length - 1
                ? { ...styles.disabled, ...styles.tool }
                : styles.tool
            }
          >
            <Redo />
          </IconButton>
        </Tooltip>
      </div>
      <div className="flex items-center -space-x-1">
        <Tooltip
          placement="top"
          title={<FormattedMessage {...translations.move} />}
        >
          <IconButton
            onClick={onClickMoveMode}
            style={
              scribing.selectedTool === 'MOVE'
                ? { color: blue[500], ...styles.tool }
                : styles.tool
            }
          >
            <OpenWithOutlined />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={t(translations.zoomIn)}>
          <IconButton onClick={onClickZoomIn} style={styles.tool}>
            <ZoomIn />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title={t(translations.zoomOut)}>
          <IconButton onClick={onClickZoomOut} style={styles.tool}>
            <ZoomOut />
          </IconButton>
        </Tooltip>
      </div>
      <div className="flex items-center">
        <Tooltip placement="top" title={t(translations.delete)}>
          <IconButton onClick={onClickDelete} style={styles.tool}>
            <Delete />
          </IconButton>
        </Tooltip>
      </div>
      <div className="flex items-center">
        <SavingIndicator savingStatus={getSavingStatus()} />
      </div>
    </div>
  );
};

export default ScribingToolbar;
