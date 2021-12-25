import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import FontIcon from 'material-ui/FontIcon';
import MaterialTooltip from 'material-ui/internal/Tooltip';
import { blue500 } from 'material-ui/styles/colors';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import PropTypes from 'prop-types';

import {
  scribingPopoverTypes,
  scribingShapes,
  scribingToolColor,
  scribingToolLineStyle,
  scribingTools,
  scribingToolThickness,
} from '../../constants';
import { scribingShape } from '../../propTypes';
import { scribingTranslations as translations } from '../../translations';

import DrawPopover from './popovers/DrawPopover';
import LinePopover from './popovers/LinePopover';
import ShapePopover from './popovers/ShapePopover';
import TypePopover from './popovers/TypePopover';
import LayersComponent from './LayersComponent';
import SavingIndicator from './SavingIndicator';
import ToolDropdown from './ToolDropdown';

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

const ToolIconComponent = ({ scribing, lineToolStyle }) => (
  <div
    style={
      scribing.activeObject && scribing.activeObject.type !== 'line'
        ? { ...lineToolStyle, background: '#c0c0c0' }
        : lineToolStyle
    }
  />
);

ToolIconComponent.propTypes = {
  scribing: scribingShape.isRequired,
  lineToolStyle: PropTypes.shape({
    background: PropTypes.string,
    display: PropTypes.string,
    position: PropTypes.string,
    width: PropTypes.string,
    height: PropTypes.string,
    marginLeft: PropTypes.string,
    transform: PropTypes.string,
  }).isRequired,
};

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

  onChangeSliderThickness = (event, toolType, value) => {
    this.props.setToolThickness(this.props.answerId, toolType, value);
  };

  onClickColorPicker = (event, toolType) => {
    this.setState(({ colorDropdowns }) => ({
      colorDropdowns: {
        ...colorDropdowns,
        [toolType]: true,
      },
      popoverColorPickerAnchor: event.currentTarget,
    }));
  };

  onClickDelete = () => {
    this.props.deleteCanvasObject(this.props.answerId);
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

  onClickLineStyleChip = (event, toolType, style) => {
    // This prevents ghost click.
    event.preventDefault();
    this.props.setLineStyleChip(this.props.answerId, toolType, style);
  };

  onClickMoveMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.MOVE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'move');
    this.props.setDisableObjectSelection(this.props.answerId);
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

  onClickRedo = () => {
    this.props.setRedo(this.props.answerId);
  };

  onClickSelectionMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.SELECT);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'default');
    this.props.setEnableObjectSelection(this.props.answerId);
  };

  onClickShapeMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.SHAPE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'crosshair');
    this.props.setDisableObjectSelection(this.props.answerId);
  };

  onClickTypingChevron = (event) => {
    this.onClickTypingMode();
    this.onClickPopover(event, scribingPopoverTypes.TYPE);
  };

  onClickTypingIcon = () => {
    this.onClickTypingMode();
  };

  onClickTypingMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.TYPE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'text');
  };

  onClickUndo = () => {
    this.props.setUndo(this.props.answerId);
  };

  onClickZoomIn = () => {
    const newZoom = this.props.scribing.canvasZoom + 0.1;
    this.props.setCanvasZoom(this.props.answerId, newZoom);
  };

  onClickZoomOut = () => {
    const newZoom = Math.max(this.props.scribing.canvasZoom - 0.1, 1);
    this.props.setCanvasZoom(this.props.answerId, newZoom);
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

  onRequestCloseColorPicker = (toolType) => {
    this.setState(({ colorDropdowns }) => ({
      colorDropdowns: {
        ...colorDropdowns,
        [toolType]: false,
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
            colorBarBackground={
              this.props.scribing.colors[scribingToolColor.TYPE]
            }
            currentTool={this.props.scribing.selectedTool}
            disabled={
              (scribing.activeObject &&
                scribing.activeObject.type !== 'i-text') ||
              false
            }
            iconClassname="fa fa-font"
            onClickChevron={this.onClickTypingChevron}
            onClickIcon={this.onClickTypingIcon}
            onMouseEnter={() => this.onMouseEnter(scribingTools.TYPE)}
            onMouseLeave={this.onMouseLeave}
            showTooltip={this.state.hoveredToolTip === scribingTools.TYPE}
            tooltip={intl.formatMessage(translations.text)}
            toolType={scribingTools.TYPE}
          />
          {scribing.activeObject && scribing.activeObject.type === 'i-text' ? (
            <TypePopover
              {...typePopoverProps}
              colorPickerColor={scribing.activeObject.fill}
              fontFamilyValue={scribing.activeObject.fontFamily}
              fontSizeValue={scribing.activeObject.fontSize}
              onChangeCompleteColorPicker={(color) => {
                scribing.activeObject.set({ fill: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.TYPE);
              }}
              onChangeFontFamily={(_, __, value) => {
                scribing.activeObject.set({ fontFamily: value });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              onChangeFontSize={(_, __, value) => {
                scribing.activeObject.set({ fontSize: value });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              onRequestClose={() => {
                this.props.setCanvasSave(this.props.answerId);
                this.setToSelectTool();
                this.onRequestClosePopover(scribingPopoverTypes.TYPE);
              }}
            />
          ) : (
            <TypePopover
              {...typePopoverProps}
              colorPickerColor={
                this.props.scribing.colors[scribingToolColor.TYPE]
              }
              fontFamilyValue={this.props.scribing.fontFamily}
              fontSizeValue={this.props.scribing.fontSize}
              onChangeCompleteColorPicker={(color) =>
                this.onChangeCompleteColor(color, scribingToolColor.TYPE)
              }
              onChangeFontFamily={this.onChangeFontFamily}
              onChangeFontSize={this.onChangeFontSize}
              onRequestClose={() =>
                this.onRequestClosePopover(scribingPopoverTypes.TYPE)
              }
            />
          )}
          <ToolDropdown
            activeObject={scribing.activeObject}
            colorBarBackground={
              this.props.scribing.colors[scribingToolColor.DRAW]
            }
            currentTool={this.props.scribing.selectedTool}
            disabled={
              (scribing.activeObject &&
                scribing.activeObject.type !== 'path') ||
              false
            }
            iconClassname="fa fa-pencil"
            onClick={this.onClickDrawingMode}
            onClickChevron={(event) =>
              this.onClickPopover(event, scribingPopoverTypes.DRAW)
            }
            onMouseEnter={() => this.onMouseEnter(scribingTools.DRAW)}
            onMouseLeave={this.onMouseLeave}
            showTooltip={this.state.hoveredToolTip === scribingTools.DRAW}
            tooltip={intl.formatMessage(translations.pencil)}
            toolType={scribingTools.DRAW}
          />
          {scribing.activeObject && scribing.activeObject.type === 'path' ? (
            <DrawPopover
              {...drawPopoverProps}
              colorPickerColor={scribing.activeObject.stroke}
              onChangeCompleteColorPicker={(color) => {
                scribing.activeObject.set({ stroke: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.DRAW);
              }}
              onChangeSliderThickness={(event, newValue) => {
                scribing.activeObject.set({ strokeWidth: newValue });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              onRequestClose={() => {
                this.props.setCanvasSave(this.props.answerId);
                this.setToSelectTool();
                this.onRequestClosePopover(scribingPopoverTypes.DRAW);
              }}
              toolThicknessValue={scribing.activeObject.strokeWidth}
            />
          ) : (
            <DrawPopover
              {...drawPopoverProps}
              colorPickerColor={
                this.props.scribing.colors[scribingToolColor.DRAW]
              }
              onChangeCompleteColorPicker={(color) =>
                this.onChangeCompleteColor(color, scribingToolColor.DRAW)
              }
              onChangeSliderThickness={(event, newValue) =>
                this.onChangeSliderThickness(
                  event,
                  scribingToolThickness.DRAW,
                  newValue,
                )
              }
              onRequestClose={() =>
                this.onRequestClosePopover(scribingPopoverTypes.DRAW)
              }
              toolThicknessValue={
                this.props.scribing.thickness[scribingToolThickness.DRAW]
              }
            />
          )}

          <ToolDropdown
            activeObject={scribing.activeObject}
            colorBarBackground={
              this.props.scribing.colors[scribingToolColor.LINE]
            }
            currentTool={this.props.scribing.selectedTool}
            disabled={
              (scribing.activeObject &&
                scribing.activeObject.type !== 'line') ||
              false
            }
            iconComponent={
              <ToolIconComponent
                lineToolStyle={lineToolStyle}
                scribing={scribing}
              />
            }
            onClick={this.onClickLineMode}
            onClickChevron={(event) =>
              this.onClickPopover(event, scribingPopoverTypes.LINE)
            }
            onMouseEnter={() => this.onMouseEnter(scribingTools.LINE)}
            onMouseLeave={this.onMouseLeave}
            showTooltip={this.state.hoveredToolTip === scribingTools.LINE}
            tooltip={intl.formatMessage(translations.line)}
            toolType={scribingTools.LINE}
          />
          {scribing.activeObject && scribing.activeObject.type === 'line' ? (
            <LinePopover
              {...linePopoverProps}
              colorPickerColor={scribing.activeObject.stroke}
              onChangeCompleteColorPicker={(color) => {
                scribing.activeObject.set({ stroke: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.LINE);
              }}
              onChangeSliderThickness={(event, newValue) => {
                scribing.activeObject.set({ strokeWidth: newValue });
                this.props.setCanvasDirty(this.props.answerId);
              }}
              onClickColorPicker={(event) =>
                this.onClickColorPicker(event, scribingToolColor.LINE)
              }
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
              onRequestClose={() => {
                this.props.setCanvasSave(this.props.answerId);
                this.setToSelectTool();
                this.onRequestClosePopover(scribingPopoverTypes.LINE);
              }}
              selectedLineStyle={this.getActiveObjectSelectedLineStyle()}
              toolThicknessValue={scribing.activeObject.strokeWidth}
            />
          ) : (
            <LinePopover
              {...linePopoverProps}
              colorPickerColor={
                this.props.scribing.colors[scribingToolColor.LINE]
              }
              onChangeCompleteColorPicker={(color) =>
                this.onChangeCompleteColor(color, scribingToolColor.LINE)
              }
              onChangeSliderThickness={(event, newValue) =>
                this.onChangeSliderThickness(
                  event,
                  scribingToolThickness.LINE,
                  newValue,
                )
              }
              onClickColorPicker={(event) =>
                this.onClickColorPicker(event, scribingToolColor.LINE)
              }
              onClickLineStyleChip={this.onClickLineStyleChip}
              onRequestClose={() =>
                this.onRequestClosePopover(scribingPopoverTypes.LINE)
              }
              selectedLineStyle={
                this.props.scribing.lineStyles[scribingToolLineStyle.LINE]
              }
              toolThicknessValue={
                this.props.scribing.thickness[scribingToolThickness.LINE]
              }
            />
          )}

          <ToolDropdown
            activeObject={scribing.activeObject}
            colorBarBackground={
              this.props.scribing.colors[scribingToolColor.SHAPE_FILL]
            }
            colorBarBorder={
              this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]
            }
            currentTool={this.props.scribing.selectedTool}
            disabled={
              (scribing.activeObject &&
                scribing.activeObject.type !== 'rect' &&
                scribing.activeObject.type !== 'ellipse') ||
              false
            }
            iconClassname={shapeIcon}
            onClick={this.onClickShapeMode}
            onClickChevron={(event) =>
              this.onClickPopover(event, scribingPopoverTypes.SHAPE)
            }
            onMouseEnter={() => this.onMouseEnter(scribingTools.SHAPE)}
            onMouseLeave={this.onMouseLeave}
            showTooltip={this.state.hoveredToolTip === scribingTools.SHAPE}
            tooltip={intl.formatMessage(translations.shape)}
            toolType={scribingTools.SHAPE}
          />
          {scribing.activeObject &&
          (scribing.activeObject.type === 'rect' ||
            scribing.activeObject.type === 'ellipse') ? (
            <ShapePopover
              {...shapePopoverProps}
              borderColorPickerColor={scribing.activeObject.stroke}
              displayShapeField={false}
              fillColorPickerColor={scribing.activeObject.fill}
              onChangeCompleteBorderColorPicker={(color) => {
                scribing.activeObject.set({ stroke: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.SHAPE_BORDER);
              }}
              onChangeCompleteFillColorPicker={(color) => {
                scribing.activeObject.set({ fill: color });
                this.props.setCanvasDirty(this.props.answerId);
                this.onRequestCloseColorPicker(scribingToolColor.SHAPE_FILL);
              }}
              onChangeSliderThickness={(event, newValue) => {
                scribing.activeObject.set({ strokeWidth: newValue });
                this.props.setCanvasDirty(this.props.answerId);
              }}
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
              onRequestClose={() => {
                this.props.setCanvasSave(this.props.answerId);
                this.setToSelectTool();
                this.onRequestClosePopover(scribingPopoverTypes.SHAPE);
                this.props.setNoFill(this.props.answerId, false);
              }}
              selectedLineStyle={this.getActiveObjectSelectedLineStyle()}
              toolThicknessValue={scribing.activeObject.strokeWidth}
            />
          ) : (
            <ShapePopover
              {...shapePopoverProps}
              borderColorPickerColor={
                this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]
              }
              displayShapeField={true}
              fillColorPickerColor={
                this.props.scribing.colors[scribingToolColor.SHAPE_FILL]
              }
              onChangeCompleteBorderColorPicker={(color) =>
                this.onChangeCompleteColor(
                  color,
                  scribingToolColor.SHAPE_BORDER,
                )
              }
              onChangeCompleteFillColorPicker={(color) =>
                this.onChangeCompleteColor(color, scribingToolColor.SHAPE_FILL)
              }
              onChangeSliderThickness={(event, newValue) =>
                this.onChangeSliderThickness(
                  event,
                  scribingToolThickness.SHAPE_BORDER,
                  newValue,
                )
              }
              onClickLineStyleChip={this.onClickLineStyleChip}
              onRequestClose={() => {
                this.onRequestClosePopover(scribingPopoverTypes.SHAPE);
                this.props.setNoFill(this.props.answerId, false);
              }}
              selectedLineStyle={
                this.props.scribing.lineStyles[
                  scribingToolLineStyle.SHAPE_BORDER
                ]
              }
              toolThicknessValue={
                this.props.scribing.thickness[
                  scribingToolThickness.SHAPE_BORDER
                ]
              }
            />
          )}
        </ToolbarGroup>
        <ToolbarGroup>
          <LayersComponent
            anchorEl={this.state.popoverAnchor}
            disabled={
              this.props.scribing.layers &&
              this.props.scribing.layers.length === 0
            }
            layers={this.props.scribing.layers}
            onClick={(event) =>
              this.onClickPopover(event, scribingPopoverTypes.LAYER)
            }
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
            onRequestClose={() =>
              this.onRequestClosePopover(scribingPopoverTypes.LAYER)
            }
            open={this.state.popovers[scribingPopoverTypes.LAYER]}
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
            hoverColor={blue500}
            onClick={this.onClickSelectionMode}
            onMouseEnter={() => this.onMouseEnter(scribingTools.SELECT)}
            onMouseLeave={this.onMouseLeave}
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
            hoverColor={blue500}
            onClick={this.onClickUndo}
            onMouseEnter={() => this.onMouseEnter(scribingTools.UNDO)}
            onMouseLeave={this.onMouseLeave}
            style={
              this.props.scribing.currentStateIndex < 1
                ? styles.disabled
                : undefined
            }
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
            hoverColor={blue500}
            onClick={this.onClickRedo}
            onMouseEnter={() => this.onMouseEnter(scribingTools.REDO)}
            onMouseLeave={this.onMouseLeave}
            style={
              this.props.scribing.currentStateIndex >=
              this.props.scribing.canvasStates.length - 1
                ? styles.disabled
                : undefined
            }
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
            hoverColor={blue500}
            onClick={this.onClickMoveMode}
            onMouseEnter={() => this.onMouseEnter(scribingTools.MOVE)}
            onMouseLeave={this.onMouseLeave}
            style={
              this.props.scribing.selectedTool === scribingTools.MOVE
                ? { color: blue500 }
                : {}
            }
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
            hoverColor={blue500}
            onClick={this.onClickZoomIn}
            onMouseEnter={() => this.onMouseEnter(scribingTools.ZOOM_IN)}
            onMouseLeave={this.onMouseLeave}
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
            hoverColor={blue500}
            onClick={this.onClickZoomOut}
            onMouseEnter={() => this.onMouseEnter(scribingTools.ZOOM_OUT)}
            onMouseLeave={this.onMouseLeave}
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
            hoverColor={blue500}
            onClick={this.onClickDelete}
            onMouseEnter={() => this.onMouseEnter(scribingTools.DELETE)}
            onMouseLeave={this.onMouseLeave}
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
            hasError={this.props.scribing.hasError}
            isSaved={this.props.scribing.isSaved}
            isSaving={this.props.scribing.isSaving}
          />
        </ToolbarGroup>
      </Toolbar>
    );
  }
}

ScribingToolbar.propTypes = propTypes;
export default injectIntl(ScribingToolbar);
