/* eslint react/sort-comp: "off" */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import FontIcon from 'material-ui/FontIcon';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import MaterialTooltip from 'material-ui/internal/Tooltip';
import { blue500 } from 'material-ui/styles/colors';

import SavingIndicator from './SavingIndicator';
import ToolDropdown from './ToolDropdown';
import LayersComponent from './LayersComponent';
import TypePopover from './popovers/TypePopover';
import DrawPopover from './popovers/DrawPopover';
import LinePopover from './popovers/LinePopover';
import ShapePopover from './popovers/ShapePopover';

import { scribingShape } from '../../propTypes';
import { scribingTranslations as translations } from '../../translations';
import {
  scribingTools,
  scribingShapes,
  scribingToolColor,
  scribingToolThickness,
  scribingToolLineStyle,
  scribingPopoverTypes,
} from '../../constants';

const propTypes = {
  intl: intlShape.isRequired,
  answerId: PropTypes.number.isRequired,
  scribing: scribingShape,
  setLayerDisplay: PropTypes.func.isRequired,
  setToolSelected: PropTypes.func.isRequired,
  setFontFamily: PropTypes.func.isRequired,
  setFontSize: PropTypes.func.isRequired,
  setLineStyleChip: PropTypes.func.isRequired,
  setColoringToolColor: PropTypes.func.isRequired,
  setToolThickness: PropTypes.func.isRequired,
  setSelectedShape: PropTypes.func.isRequired,
  setNoFill: PropTypes.func.isRequired,
  setDrawingMode: PropTypes.func.isRequired,
  setCanvasCursor: PropTypes.func.isRequired,
  setCanvasZoom: PropTypes.func.isRequired,
  setCanvasDirty: PropTypes.func.isRequired,
  setCanvasSave: PropTypes.func.isRequired,
  deleteCanvasObject: PropTypes.func.isRequired,
  setDisableObjectSelection: PropTypes.func.isRequired,
  setEnableObjectSelection: PropTypes.func.isRequired,
  setUndo: PropTypes.func.isRequired,
  setRedo: PropTypes.func.isRequired,
};

const styles = {
  toolbar: {
    marginBottom: '1em',
  },
  disabledToolbar: {
    cursor: 'not-allowed',
    pointerEvents: 'none',
    opacity: '0.15',
    filter: 'alpha(opacity=65)',
    boxShadow: 'none',
    marginBottom: '1em',
  },
  customLine: {
    display: 'inline-block',
    position: 'inherit',
    width: '25px',
    height: '21px',
    marginLeft: '-2px',
    transform: 'scale(1.0, 0.2) rotate(90deg) skewX(76deg)',
  },
  tool: {
    position: 'relative',
    display: 'inline-block',
    paddingRight: '24px',
  },
  disabled: {
    cursor: 'not-allowed',
    pointerEvents: 'none',
    color: '#c0c0c0',
  },
};

function initializeColorDropdowns() {
  const colorDropdowns = {};
  Object.values(scribingToolColor).forEach((toolType) => {
    colorDropdowns[toolType] = false;
  });
  return colorDropdowns;
}

function initializePopovers() {
  const popovers = {};
  Object.values(scribingPopoverTypes).forEach((popoverType) => {
    popovers[popoverType] = false;
  });
  return popovers;
}

class ScribingToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredToolTip: '',
      colorDropdowns: initializeColorDropdowns(),
      popoverColorPickerAnchor: undefined,
      popovers: initializePopovers(),
      popoverAnchor: undefined,
    };
  }

  // Toolbar Event handlers

  onChangeCompleteColor = (color, coloringTool) => {
    this.props.setColoringToolColor(this.props.answerId, coloringTool, color);
  };

  onChangeFontFamily = (event, index, value) =>
    this.props.setFontFamily(this.props.answerId, value);

  onChangeFontSize = (event, index, value) =>
    this.props.setFontSize(this.props.answerId, value);

  onClickColorPicker = (event, toolType) => {
    this.setState(({ colorDropdowns }) => ({
      colorDropdowns: {
        ...colorDropdowns,
        [toolType]: true,
      },
      popoverColorPickerAnchor: event.currentTarget,
    }));
  };

  onRequestCloseColorPicker = (toolType) => {
    this.setState(({ colorDropdowns }) => ({
      colorDropdowns: {
        ...colorDropdowns,
        [toolType]: false,
      },
    }));
  };

  onClickPopover = (event, popoverType) => {
    const popoverAnchor =
      popoverType === scribingPopoverTypes.LAYER
        ? event.currentTarget
        : event.currentTarget.parentElement.parentElement;
    this.setState(({ popovers }) => ({
      popoverAnchor,
      popovers: {
        ...popovers,
        [popoverType]: true,
      },
    }));
  };

  onRequestClosePopover = (popoverType) => {
    this.setState(({ popovers }) => ({
      popovers: {
        ...popovers,
        [popoverType]: false,
      },
    }));
  };

  onClickLineStyleChip = (event, toolType, style) => {
    // This prevents ghost click.
    event.preventDefault();
    this.props.setLineStyleChip(this.props.answerId, toolType, style);
  };

  onChangeSliderThickness = (event, toolType, value) => {
    this.props.setToolThickness(this.props.answerId, toolType, value);
  };

  onClickTypingMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.TYPE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'text');
  };

  onClickTypingIcon = () => {
    this.onClickTypingMode();
  };

  onClickTypingChevron = (event) => {
    this.onClickTypingMode();
    this.onClickPopover(event, scribingPopoverTypes.TYPE);
  };

  onClickDrawingMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.DRAW);
    // isDrawingMode automatically disables selection mode in fabric.js
    this.props.setDrawingMode(this.props.answerId, true);
  };

  onClickLineMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.LINE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'crosshair');
    this.props.setDisableObjectSelection(this.props.answerId);
  };

  onClickShapeMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.SHAPE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'crosshair');
    this.props.setDisableObjectSelection(this.props.answerId);
  };

  onClickSelectionMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.SELECT);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'default');
    this.props.setEnableObjectSelection(this.props.answerId);
  };

  onClickMoveMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.MOVE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'move');
    this.props.setDisableObjectSelection(this.props.answerId);
  };

  onClickZoomIn = () => {
    const newZoom = this.props.scribing.canvasZoom + 0.1;
    this.props.setCanvasZoom(this.props.answerId, newZoom);
  };

  onClickZoomOut = () => {
    const newZoom = Math.max(this.props.scribing.canvasZoom - 0.1, 1);
    this.props.setCanvasZoom(this.props.answerId, newZoom);
  };

  onClickDelete = () => {
    this.props.deleteCanvasObject(this.props.answerId);
  };

  onClickUndo = () => {
    this.props.setUndo(this.props.answerId);
  };

  onClickRedo = () => {
    this.props.setRedo(this.props.answerId);
  };

  onMouseEnter(toolType) {
    this.setState({
      hoveredToolTip: toolType,
    });
  }

  onMouseLeave = () => {
    this.setState({
      hoveredToolTip: '',
    });
  };

  // Helpers

  setSelectedShape = (shape) => {
    this.props.setSelectedShape(this.props.answerId, shape);
  };

  setToSelectTool = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.SELECT);
    this.props.setCanvasCursor(this.props.answerId, 'default');
    this.props.setEnableObjectSelection(this.props.answerId);
    this.props.setDrawingMode(this.props.answerId, false);
  };

  getActiveObjectSelectedLineStyle = () => {
    const { activeObject } = this.props.scribing;
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

  render() {
    const { intl, scribing } = this.props;
    const lineToolStyle = {
      ...styles.customLine,
      background:
        this.props.scribing.selectedTool === scribingTools.LINE
          ? blue500
          : 'rgba(0, 0, 0, 0.4)',
    };
    const toolBarStyle = !scribing.isCanvasLoaded
      ? styles.disabledToolbar
      : styles.toolBar;
    const isNewRect = this.props.scribing.selectedShape === scribingShapes.RECT;
    const isEditRect =
      scribing.activeObject && scribing.activeObject.type === 'rect';
    const shapeIcon =
      isNewRect || isEditRect ? 'fa fa-square-o' : 'fa fa-circle-o';

    const typePopoverProps = {
      open: this.state.popovers[scribingPopoverTypes.TYPE],
      anchorEl: this.state.popoverAnchor,
      onClickColorPicker: (event) =>
        this.onClickColorPicker(event, scribingToolColor.TYPE),
      colorPickerPopoverOpen: this.state.colorDropdowns[scribingToolColor.TYPE],
      colorPickerPopoverAnchorEl: this.state.popoverColorPickerAnchor,
      onRequestCloseColorPickerPopover: () =>
        this.onRequestCloseColorPicker(scribingToolColor.TYPE),
    };

    const drawPopoverProps = {
      open: this.state.popovers[scribingPopoverTypes.DRAW],
      anchorEl: this.state.popoverAnchor,
      onClickColorPicker: (event) =>
        this.onClickColorPicker(event, scribingToolColor.DRAW),
      colorPickerPopoverOpen: this.state.colorDropdowns[scribingToolColor.DRAW],
      colorPickerPopoverAnchorEl: this.state.popoverColorPickerAnchor,
      onRequestCloseColorPickerPopover: () =>
        this.onRequestCloseColorPicker(scribingToolColor.DRAW),
    };

    const linePopoverProps = {
      lineToolType: scribingToolThickness.LINE,
      open: this.state.popovers[scribingPopoverTypes.LINE],
      anchorEl: this.state.popoverAnchor,
      colorPickerPopoverOpen: this.state.colorDropdowns[scribingToolColor.LINE],
      colorPickerPopoverAnchorEl: this.state.popoverColorPickerAnchor,
      onRequestCloseColorPickerPopover: () =>
        this.onRequestCloseColorPicker(scribingToolColor.LINE),
    };

    const shapePopoverProps = {
      lineToolType: scribingToolThickness.SHAPE_BORDER,
      open: this.state.popovers[scribingPopoverTypes.SHAPE],
      anchorEl: this.state.popoverAnchor,
      currentShape: this.props.scribing.selectedShape,
      setSelectedShape: (shape) => this.setSelectedShape(shape),
      onClickBorderColorPicker: (event) =>
        this.onClickColorPicker(event, scribingToolColor.SHAPE_BORDER),
      borderColorPickerPopoverOpen:
        this.state.colorDropdowns[scribingToolColor.SHAPE_BORDER],
      borderColorPickerPopoverAnchorEl: this.state.popoverColorPickerAnchor,
      onRequestCloseBorderColorPickerPopover: () =>
        this.onRequestCloseColorPicker(scribingToolColor.SHAPE_BORDER),
      onClickFillColorPicker: (event) =>
        this.onClickColorPicker(event, scribingToolColor.SHAPE_FILL),
      fillColorPickerPopoverOpen:
        this.state.colorDropdowns[scribingToolColor.SHAPE_FILL],
      fillColorPickerPopoverAnchorEl: this.state.popoverColorPickerAnchor,
      noFillValue: scribing.hasNoFill,
      noFillOnCheck: (checked) =>
        this.props.setNoFill(this.props.answerId, checked),
      onRequestCloseFillColorPickerPopover: () =>
        this.onRequestCloseColorPicker(scribingToolColor.SHAPE_FILL),
    };

    return (
      <Toolbar
        style={{
          ...toolBarStyle,
          width:
            this.props.scribing.isCanvasLoaded &&
            this.props.scribing.canvasMaxWidth,
        }}
      >
        <ToolbarGroup>
          <ToolDropdown
            activeObject={scribing.activeObject}
            disabled={
              (scribing.activeObject &&
                scribing.activeObject.type !== 'i-text') ||
              false
            }
            toolType={scribingTools.TYPE}
            tooltip={intl.formatMessage(translations.text)}
            showTooltip={this.state.hoveredToolTip === scribingTools.TYPE}
            currentTool={this.props.scribing.selectedTool}
            onClickIcon={this.onClickTypingIcon}
            colorBarBackground={
              this.props.scribing.colors[scribingToolColor.TYPE]
            }
            onClickChevron={this.onClickTypingChevron}
            iconClassname="fa fa-font"
            onMouseEnter={() => this.onMouseEnter(scribingTools.TYPE)}
            onMouseLeave={this.onMouseLeave}
          />
          {scribing.activeObject && scribing.activeObject.type === 'i-text' ? (
            <TypePopover
              {...typePopoverProps}
              onRequestClose={() => {
                this.props.setCanvasSave(this.props.answerId);
                this.setToSelectTool();
                this.onRequestClosePopover(scribingPopoverTypes.TYPE);
              }}
              fontFamilyValue={scribing.activeObject.fontFamily}
              onChangeFontFamily={(_, __, value) => {
                scribing.activeObject.set({ fontFamily: value });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              fontSizeValue={scribing.activeObject.fontSize}
              onChangeFontSize={(_, __, value) => {
                scribing.activeObject.set({ fontSize: value });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              colorPickerColor={scribing.activeObject.fill}
              onChangeCompleteColorPicker={(color) => {
                scribing.activeObject.set({ fill: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.TYPE);
              }}
            />
          ) : (
            <TypePopover
              {...typePopoverProps}
              onRequestClose={() =>
                this.onRequestClosePopover(scribingPopoverTypes.TYPE)
              }
              fontFamilyValue={this.props.scribing.fontFamily}
              onChangeFontFamily={this.onChangeFontFamily}
              fontSizeValue={this.props.scribing.fontSize}
              onChangeFontSize={this.onChangeFontSize}
              colorPickerColor={
                this.props.scribing.colors[scribingToolColor.TYPE]
              }
              onChangeCompleteColorPicker={(color) =>
                this.onChangeCompleteColor(color, scribingToolColor.TYPE)
              }
            />
          )}
          <ToolDropdown
            activeObject={scribing.activeObject}
            disabled={
              (scribing.activeObject &&
                scribing.activeObject.type !== 'path') ||
              false
            }
            toolType={scribingTools.DRAW}
            tooltip={intl.formatMessage(translations.pencil)}
            showTooltip={this.state.hoveredToolTip === scribingTools.DRAW}
            currentTool={this.props.scribing.selectedTool}
            onClick={this.onClickDrawingMode}
            colorBarBackground={
              this.props.scribing.colors[scribingToolColor.DRAW]
            }
            onClickChevron={(event) =>
              this.onClickPopover(event, scribingPopoverTypes.DRAW)
            }
            iconClassname="fa fa-pencil"
            onMouseEnter={() => this.onMouseEnter(scribingTools.DRAW)}
            onMouseLeave={this.onMouseLeave}
          />
          {scribing.activeObject && scribing.activeObject.type === 'path' ? (
            <DrawPopover
              {...drawPopoverProps}
              onRequestClose={() => {
                this.props.setCanvasSave(this.props.answerId);
                this.setToSelectTool();
                this.onRequestClosePopover(scribingPopoverTypes.DRAW);
              }}
              toolThicknessValue={scribing.activeObject.strokeWidth}
              onChangeSliderThickness={(event, newValue) => {
                scribing.activeObject.set({ strokeWidth: newValue });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              colorPickerColor={scribing.activeObject.stroke}
              onChangeCompleteColorPicker={(color) => {
                scribing.activeObject.set({ stroke: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.DRAW);
              }}
            />
          ) : (
            <DrawPopover
              {...drawPopoverProps}
              onRequestClose={() =>
                this.onRequestClosePopover(scribingPopoverTypes.DRAW)
              }
              toolThicknessValue={
                this.props.scribing.thickness[scribingToolThickness.DRAW]
              }
              onChangeSliderThickness={(event, newValue) =>
                this.onChangeSliderThickness(
                  event,
                  scribingToolThickness.DRAW,
                  newValue,
                )
              }
              colorPickerColor={
                this.props.scribing.colors[scribingToolColor.DRAW]
              }
              onChangeCompleteColorPicker={(color) =>
                this.onChangeCompleteColor(color, scribingToolColor.DRAW)
              }
            />
          )}

          <ToolDropdown
            activeObject={scribing.activeObject}
            disabled={
              (scribing.activeObject &&
                scribing.activeObject.type !== 'line') ||
              false
            }
            toolType={scribingTools.LINE}
            tooltip={intl.formatMessage(translations.line)}
            showTooltip={this.state.hoveredToolTip === scribingTools.LINE}
            currentTool={this.props.scribing.selectedTool}
            onClick={this.onClickLineMode}
            colorBarBackground={
              this.props.scribing.colors[scribingToolColor.LINE]
            }
            onClickChevron={(event) =>
              this.onClickPopover(event, scribingPopoverTypes.LINE)
            }
            iconComponent={() => (
              <div
                style={
                  scribing.activeObject && scribing.activeObject.type !== 'line'
                    ? { ...lineToolStyle, background: '#c0c0c0' }
                    : lineToolStyle
                }
              />
            )}
            onMouseEnter={() => this.onMouseEnter(scribingTools.LINE)}
            onMouseLeave={this.onMouseLeave}
          />
          {scribing.activeObject && scribing.activeObject.type === 'line' ? (
            <LinePopover
              {...linePopoverProps}
              onRequestClose={() => {
                this.props.setCanvasSave(this.props.answerId);
                this.setToSelectTool();
                this.onRequestClosePopover(scribingPopoverTypes.LINE);
              }}
              selectedLineStyle={this.getActiveObjectSelectedLineStyle()}
              onClickLineStyleChip={(_, __, style) => {
                let strokeDashArray = [];
                if (style === 'dotted') {
                  strokeDashArray = [1, 3];
                } else if (style === 'dashed') {
                  strokeDashArray = [10, 5];
                }
                scribing.activeObject.set({ strokeDashArray });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              toolThicknessValue={scribing.activeObject.strokeWidth}
              onChangeSliderThickness={(event, newValue) => {
                scribing.activeObject.set({ strokeWidth: newValue });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              colorPickerColor={scribing.activeObject.stroke}
              onClickColorPicker={(event) =>
                this.onClickColorPicker(event, scribingToolColor.LINE)
              }
              onChangeCompleteColorPicker={(color) => {
                scribing.activeObject.set({ stroke: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.LINE);
              }}
            />
          ) : (
            <LinePopover
              {...linePopoverProps}
              onRequestClose={() =>
                this.onRequestClosePopover(scribingPopoverTypes.LINE)
              }
              selectedLineStyle={
                this.props.scribing.lineStyles[scribingToolLineStyle.LINE]
              }
              onClickLineStyleChip={this.onClickLineStyleChip}
              toolThicknessValue={
                this.props.scribing.thickness[scribingToolThickness.LINE]
              }
              onChangeSliderThickness={(event, newValue) =>
                this.onChangeSliderThickness(
                  event,
                  scribingToolThickness.LINE,
                  newValue,
                )
              }
              colorPickerColor={
                this.props.scribing.colors[scribingToolColor.LINE]
              }
              onClickColorPicker={(event) =>
                this.onClickColorPicker(event, scribingToolColor.LINE)
              }
              onChangeCompleteColorPicker={(color) =>
                this.onChangeCompleteColor(color, scribingToolColor.LINE)
              }
            />
          )}

          <ToolDropdown
            activeObject={scribing.activeObject}
            disabled={
              (scribing.activeObject &&
                scribing.activeObject.type !== 'rect' &&
                scribing.activeObject.type !== 'ellipse') ||
              false
            }
            toolType={scribingTools.SHAPE}
            tooltip={intl.formatMessage(translations.shape)}
            showTooltip={this.state.hoveredToolTip === scribingTools.SHAPE}
            currentTool={this.props.scribing.selectedTool}
            onClick={this.onClickShapeMode}
            colorBarBorder={
              this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]
            }
            colorBarBackground={
              this.props.scribing.colors[scribingToolColor.SHAPE_FILL]
            }
            onMouseEnter={() => this.onMouseEnter(scribingTools.SHAPE)}
            onMouseLeave={this.onMouseLeave}
            onClickChevron={(event) =>
              this.onClickPopover(event, scribingPopoverTypes.SHAPE)
            }
            iconClassname={shapeIcon}
          />
          {scribing.activeObject &&
          (scribing.activeObject.type === 'rect' ||
            scribing.activeObject.type === 'ellipse') ? (
            <ShapePopover
              {...shapePopoverProps}
              onRequestClose={() => {
                this.props.setCanvasSave(this.props.answerId);
                this.setToSelectTool();
                this.onRequestClosePopover(scribingPopoverTypes.SHAPE);
                this.props.setNoFill(this.props.answerId, false);
              }}
              displayShapeField={false}
              selectedLineStyle={this.getActiveObjectSelectedLineStyle()}
              onClickLineStyleChip={(_, __, style) => {
                let strokeDashArray = [];
                if (style === 'dotted') {
                  strokeDashArray = [1, 3];
                } else if (style === 'dashed') {
                  strokeDashArray = [10, 5];
                }
                scribing.activeObject.set({ strokeDashArray });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              toolThicknessValue={scribing.activeObject.strokeWidth}
              onChangeSliderThickness={(event, newValue) => {
                scribing.activeObject.set({ strokeWidth: newValue });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              borderColorPickerColor={scribing.activeObject.stroke}
              onChangeCompleteBorderColorPicker={(color) => {
                scribing.activeObject.set({ stroke: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.SHAPE_BORDER);
              }}
              fillColorPickerColor={scribing.activeObject.fill}
              onChangeCompleteFillColorPicker={(color) => {
                scribing.activeObject.set({ fill: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.SHAPE_FILL);
              }}
            />
          ) : (
            <ShapePopover
              {...shapePopoverProps}
              onRequestClose={() => {
                this.onRequestClosePopover(scribingPopoverTypes.SHAPE);
                this.props.setNoFill(this.props.answerId, false);
              }}
              displayShapeField
              selectedLineStyle={
                this.props.scribing.lineStyles[
                  scribingToolLineStyle.SHAPE_BORDER
                ]
              }
              onClickLineStyleChip={this.onClickLineStyleChip}
              toolThicknessValue={
                this.props.scribing.thickness[
                  scribingToolThickness.SHAPE_BORDER
                ]
              }
              onChangeSliderThickness={(event, newValue) =>
                this.onChangeSliderThickness(
                  event,
                  scribingToolThickness.SHAPE_BORDER,
                  newValue,
                )
              }
              borderColorPickerColor={
                this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]
              }
              onChangeCompleteBorderColorPicker={(color) =>
                this.onChangeCompleteColor(
                  color,
                  scribingToolColor.SHAPE_BORDER,
                )
              }
              fillColorPickerColor={
                this.props.scribing.colors[scribingToolColor.SHAPE_FILL]
              }
              onChangeCompleteFillColorPicker={(color) =>
                this.onChangeCompleteColor(color, scribingToolColor.SHAPE_FILL)
              }
            />
          )}
        </ToolbarGroup>
        <ToolbarGroup>
          <LayersComponent
            onClick={(event) =>
              this.onClickPopover(event, scribingPopoverTypes.LAYER)
            }
            disabled={
              this.props.scribing.layers &&
              this.props.scribing.layers.length === 0
            }
            open={this.state.popovers[scribingPopoverTypes.LAYER]}
            anchorEl={this.state.popoverAnchor}
            onRequestClose={() =>
              this.onRequestClosePopover(scribingPopoverTypes.LAYER)
            }
            layers={this.props.scribing.layers}
            onClickLayer={(layer) => {
              this.props.scribing.layers.forEach((l) => {
                if (l.creator_id === layer.creator_id) {
                  const newDisplay = !l.isDisplayed;
                  this.props.setLayerDisplay(
                    this.props.answerId,
                    layer.creator_id,
                    newDisplay,
                  );
                  l.showLayer(newDisplay);
                }
              });
            }}
          />
        </ToolbarGroup>
        <ToolbarGroup>
          <FontIcon
            className="fa fa-mouse-pointer"
            color={
              this.props.scribing.selectedTool === scribingTools.SELECT
                ? blue500
                : undefined
            }
            onClick={this.onClickSelectionMode}
            onMouseEnter={() => this.onMouseEnter(scribingTools.SELECT)}
            onMouseLeave={this.onMouseLeave}
            hoverColor={blue500}
          >
            <MaterialTooltip
              horizontalPosition="center"
              label={intl.formatMessage(translations.select)}
              show={this.state.hoveredToolTip === scribingTools.SELECT}
              verticalPosition="top"
            />
          </FontIcon>
          <FontIcon
            className="fa fa-undo"
            onClick={this.onClickUndo}
            onMouseEnter={() => this.onMouseEnter(scribingTools.UNDO)}
            onMouseLeave={this.onMouseLeave}
            style={
              this.props.scribing.currentStateIndex < 1
                ? styles.disabled
                : undefined
            }
            hoverColor={blue500}
          >
            <MaterialTooltip
              horizontalPosition="center"
              label={intl.formatMessage(translations.undo)}
              show={this.state.hoveredToolTip === scribingTools.UNDO}
              verticalPosition="top"
            />
          </FontIcon>
          <FontIcon
            className="fa fa-repeat"
            onClick={this.onClickRedo}
            onMouseEnter={() => this.onMouseEnter(scribingTools.REDO)}
            onMouseLeave={this.onMouseLeave}
            style={
              this.props.scribing.currentStateIndex >=
              this.props.scribing.canvasStates.length - 1
                ? styles.disabled
                : undefined
            }
            hoverColor={blue500}
          >
            <MaterialTooltip
              horizontalPosition="center"
              label={intl.formatMessage(translations.redo)}
              show={this.state.hoveredToolTip === scribingTools.REDO}
              verticalPosition="top"
            />
          </FontIcon>
        </ToolbarGroup>
        <ToolbarGroup>
          <FontIcon
            className="fa fa-arrows"
            style={
              this.props.scribing.selectedTool === scribingTools.MOVE
                ? { color: blue500 }
                : {}
            }
            onClick={this.onClickMoveMode}
            onMouseEnter={() => this.onMouseEnter(scribingTools.MOVE)}
            onMouseLeave={this.onMouseLeave}
            hoverColor={blue500}
          >
            <MaterialTooltip
              horizontalPosition="center"
              label={intl.formatMessage(translations.move)}
              show={this.state.hoveredToolTip === scribingTools.MOVE}
              verticalPosition="top"
            />
          </FontIcon>
          <FontIcon
            className="fa fa-search-plus"
            onClick={this.onClickZoomIn}
            onMouseEnter={() => this.onMouseEnter(scribingTools.ZOOM_IN)}
            onMouseLeave={this.onMouseLeave}
            hoverColor={blue500}
          >
            <MaterialTooltip
              horizontalPosition="center"
              label={intl.formatMessage(translations.zoomIn)}
              show={this.state.hoveredToolTip === scribingTools.ZOOM_IN}
              verticalPosition="top"
            />
          </FontIcon>
          <FontIcon
            className="fa fa-search-minus"
            onClick={this.onClickZoomOut}
            onMouseEnter={() => this.onMouseEnter(scribingTools.ZOOM_OUT)}
            onMouseLeave={this.onMouseLeave}
            hoverColor={blue500}
          >
            <MaterialTooltip
              horizontalPosition="center"
              label={intl.formatMessage(translations.zoomOut)}
              show={this.state.hoveredToolTip === scribingTools.ZOOM_OUT}
              verticalPosition="top"
            />
          </FontIcon>
        </ToolbarGroup>
        <ToolbarGroup>
          <FontIcon
            className="fa fa-trash-o"
            onClick={this.onClickDelete}
            onMouseEnter={() => this.onMouseEnter(scribingTools.DELETE)}
            onMouseLeave={this.onMouseLeave}
            hoverColor={blue500}
          >
            <MaterialTooltip
              horizontalPosition="center"
              label={intl.formatMessage(translations.delete)}
              show={this.state.hoveredToolTip === scribingTools.DELETE}
              verticalPosition="top"
            />
          </FontIcon>
        </ToolbarGroup>
        <ToolbarGroup>
          <SavingIndicator
            isSaving={this.props.scribing.isSaving}
            isSaved={this.props.scribing.isSaved}
            hasError={this.props.scribing.hasError}
          />
        </ToolbarGroup>
      </Toolbar>
    );
  }
}

ScribingToolbar.propTypes = propTypes;
export default injectIntl(ScribingToolbar);
