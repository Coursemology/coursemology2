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
import { scribingTools, scribingShapes, scribingToolColor, scribingToolThickness,
         scribingToolLineStyle, scribingPopoverTypes } from '../../constants';

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
  clearSavingStatus: PropTypes.func.isRequired,
  setDrawingMode: PropTypes.func.isRequired,
  setCanvasCursor: PropTypes.func.isRequired,
  setCanvasZoom: PropTypes.func.isRequired,
  deleteCanvasObject: PropTypes.func.isRequired,
  setDisableObjectSelection: PropTypes.func.isRequired,
  setEnableObjectSelection: PropTypes.func.isRequired,
  setEnableTextSelection: PropTypes.func.isRequired,
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
};

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
    this.viewportLeft = 0;
    this.viewportTop = 0;
    this.textCreated = false;
  }

  // Toolbar Event handlers

  onChangeCompleteColor = (color, coloringTool) => {
    this.props.setColoringToolColor(this.props.answerId, coloringTool, this.getRgbaHelper(color.rgb));
    this.setState({
      ...this.state,
      colorDropdowns: {
        ...this.state.colorDropdowns,
        [coloringTool]: false,
      },
    });
  }

  onChangeFontFamily = (event, index, value) => (
    this.props.setFontFamily(this.props.answerId, value)
  )

  onChangeFontSize = (event, index, value) => (
    this.props.setFontSize(this.props.answerId, value)
  )

  onClickColorPicker = (event, toolType) => {
    this.setState({
      ...this.state,
      colorDropdowns: {
        ...this.state.colorDropdowns,
        [toolType]: true,
      },
      popoverColorPickerAnchor: event.currentTarget,
    });
  }

  onRequestCloseColorPicker = (toolType) => {
    this.setState({
      ...this.state,
      colorDropdowns: {
        ...this.state.colorDropdowns,
        [toolType]: false,
      },
    });
  }

  onTouchTapPopover = (event, popoverType) => {
    const popoverAnchor = popoverType === scribingPopoverTypes.LAYER ?
            event.currentTarget :
            event.currentTarget.parentElement.parentElement;
    this.setState({
      ...this.state,
      popoverAnchor,
      popovers: {
        ...this.state.popovers,
        [popoverType]: true,
      },
    });
  }

  onRequestClosePopover = (popoverType) => {
    this.setState({
      ...this.state,
      popovers: {
        ...this.state.popovers,
        [popoverType]: false,
      },
    });
  }

  onTouchTapLineStyleChip = (event, toolType, style) => {
    // This prevents ghost click.
    event.preventDefault();
    this.props.setLineStyleChip(this.props.answerId, toolType, style);
  }

  onChangeSliderThickness = (event, toolType, value) => {
    this.props.setToolThickness(this.props.answerId, toolType, value);
  }

  onClickTypingMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.TYPE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'text');
    this.props.setEnableTextSelection(this.props.answerId);
  }

  onClickTypingIcon = () => {
    this.onClickTypingMode();
  }

  onClickTypingChevron = (event) => {
    this.onClickTypingMode();
    this.onTouchTapPopover(event, scribingPopoverTypes.TYPE);
  }

  onClickDrawingMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.DRAW);
    // isDrawingMode automatically disables selection mode in fabric.js
    this.props.setDrawingMode(this.props.answerId, true);
  }

  onClickLineMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.LINE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'crosshair');
    this.props.setDisableObjectSelection(this.props.answerId);
  }

  onClickShapeMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.SHAPE);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'crosshair');
    this.props.setDisableObjectSelection(this.props.answerId);
  }

  onClickSelectionMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.SELECT);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'pointer');
    this.props.setEnableObjectSelection(this.props.answerId);
  }

  onClickPanMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.PAN);
    this.props.setDrawingMode(this.props.answerId, false);
    this.props.setCanvasCursor(this.props.answerId, 'move');
    this.props.setDisableObjectSelection(this.props.answerId);
  }

  onClickZoomIn = () => {
    const newZoom = this.props.scribing.canvasZoom + 0.1;
    this.props.setCanvasZoom(this.props.answerId, newZoom);
  }

  onClickZoomOut = () => {
    const newZoom = Math.max(this.props.scribing.canvasZoom - 0.1, 1);
    this.props.setCanvasZoom(this.props.answerId, newZoom);
  }

  onClickDelete = () => {
    this.props.deleteCanvasObject(this.props.answerId);
  }

  onMouseEnter(toolType) {
    this.setState({
      ...this.state,
      hoveredToolTip: toolType,
    });
  }

  onMouseLeave = () => {
    this.setState({
      ...this.state,
      hoveredToolTip: '',
    });
  }

  // Helpers

  // Function Helpers
  getRgbaHelper = json => (
    `rgba(${json.r},${json.g},${json.b},${json.a})`
  );


  setSelectedShape = (shape) => {
    this.props.setSelectedShape(this.props.answerId, shape);
  }

  render() {
    const { intl, scribing } = this.props;
    const lineToolStyle = {
      ...styles.customLine,
      background: this.props.scribing.selectedTool === scribingTools.LINE ? blue500 : 'rgba(0, 0, 0, 0.4)',
    };
    const toolBarStyle = !scribing.isCanvasLoaded ? styles.disabledToolbar : styles.toolBar;

    return (
      <Toolbar
        style={{
          ...toolBarStyle,
          width: this.props.scribing.isCanvasLoaded && this.props.scribing.canvasMaxWidth,
        }}
      >
        <ToolbarGroup>
          <ToolDropdown
            toolType={scribingTools.TYPE}
            tooltip={intl.formatMessage(translations.text)}
            showTooltip={this.state.hoveredToolTip === scribingTools.TYPE}
            currentTool={this.props.scribing.selectedTool}
            onClickIcon={this.onClickTypingIcon}
            colorBar={this.props.scribing.colors[scribingToolColor.TYPE]}
            onTouchTapChevron={this.onClickTypingChevron}
            iconClassname="fa fa-font"
            onMouseEnter={() => this.onMouseEnter(scribingTools.TYPE)}
            onMouseLeave={this.onMouseLeave}
          />
          <TypePopover
            open={this.state.popovers[scribingPopoverTypes.TYPE]}
            anchorEl={this.state.popoverAnchor}
            onRequestClose={() => (this.onRequestClosePopover(scribingPopoverTypes.TYPE))}
            fontFamilyValue={this.props.scribing.fontFamily}
            onChangeFontFamily={this.onChangeFontFamily}
            fontSizeValue={this.props.scribing.fontSize}
            onChangeFontSize={this.onChangeFontSize}
            onClickColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.TYPE))}
            colorPickerPopoverOpen={this.state.colorDropdowns[scribingToolColor.TYPE]}
            colorPickerPopoverAnchorEl={this.state.popoverColorPickerAnchor}
            onRequestCloseColorPickerPopover={() => (this.onRequestCloseColorPicker(scribingToolColor.TYPE))}
            colorPickerColor={this.props.scribing.colors[scribingToolColor.TYPE]}
            onChangeCompleteColorPicker={color => (this.onChangeCompleteColor(color, scribingToolColor.TYPE))}
          />
          <ToolDropdown
            toolType={scribingTools.DRAW}
            tooltip={intl.formatMessage(translations.pencil)}
            showTooltip={this.state.hoveredToolTip === scribingTools.DRAW}
            currentTool={this.props.scribing.selectedTool}
            onClick={this.onClickDrawingMode}
            colorBar={this.props.scribing.colors[scribingToolColor.DRAW]}
            onTouchTapChevron={event => (this.onTouchTapPopover(event, scribingPopoverTypes.DRAW))}
            iconClassname="fa fa-pencil"
            onMouseEnter={() => this.onMouseEnter(scribingTools.DRAW)}
            onMouseLeave={this.onMouseLeave}
          />
          <DrawPopover
            open={this.state.popovers[scribingPopoverTypes.DRAW]}
            anchorEl={this.state.popoverAnchor}
            onRequestClose={() => (this.onRequestClosePopover(scribingPopoverTypes.DRAW))}
            toolThicknessValue={this.props.scribing.thickness[scribingToolThickness.DRAW]}
            onChangeSliderThickness={(event, newValue) =>
              (this.onChangeSliderThickness(event, scribingToolThickness.DRAW, newValue))
            }
            colorPickerColor={this.props.scribing.colors[scribingToolColor.DRAW]}
            onClickColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.DRAW))}
            colorPickerPopoverOpen={this.state.colorDropdowns[scribingToolColor.DRAW]}
            colorPickerPopoverAnchorEl={this.state.popoverColorPickerAnchor}
            onRequestCloseColorPickerPopover={() => (this.onRequestCloseColorPicker(scribingToolColor.DRAW))}
            onChangeCompleteColorPicker={color => (this.onChangeCompleteColor(color, scribingToolColor.DRAW))}
          />
          <ToolDropdown
            toolType={scribingTools.LINE}
            tooltip={intl.formatMessage(translations.line)}
            showTooltip={this.state.hoveredToolTip === scribingTools.LINE}
            currentTool={this.props.scribing.selectedTool}
            onClick={this.onClickLineMode}
            colorBar={this.props.scribing.colors[scribingToolColor.LINE]}
            onTouchTapChevron={event => (this.onTouchTapPopover(event, scribingPopoverTypes.LINE))}
            iconComponent={() => (<div style={lineToolStyle} />)}
            onMouseEnter={() => this.onMouseEnter(scribingTools.LINE)}
            onMouseLeave={this.onMouseLeave}
          />
          <LinePopover
            lineToolType={scribingToolThickness.LINE}
            open={this.state.popovers[scribingPopoverTypes.LINE]}
            anchorEl={this.state.popoverAnchor}
            onRequestClose={() => (this.onRequestClosePopover(scribingPopoverTypes.LINE))}
            selectedLineStyle={this.props.scribing.lineStyles[scribingToolLineStyle.LINE]}
            onTouchTapLineStyleChip={this.onTouchTapLineStyleChip}
            toolThicknessValue={this.props.scribing.thickness[scribingToolThickness.LINE]}
            onChangeSliderThickness={(event, newValue) =>
              (this.onChangeSliderThickness(event, scribingToolThickness.LINE, newValue))
            }
            colorPickerColor={this.props.scribing.colors[scribingToolColor.LINE]}
            onClickColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.LINE))}
            colorPickerPopoverOpen={this.state.colorDropdowns[scribingToolColor.LINE]}
            colorPickerPopoverAnchorEl={this.state.popoverColorPickerAnchor}
            onRequestCloseColorPickerPopover={() => (this.onRequestCloseColorPicker(scribingToolColor.LINE))}
            onChangeCompleteColorPicker={color => (this.onChangeCompleteColor(color, scribingToolColor.LINE))}
          />
          <ToolDropdown
            toolType={scribingTools.SHAPE}
            tooltip={intl.formatMessage(translations.shape)}
            showTooltip={this.state.hoveredToolTip === scribingTools.SHAPE}
            currentTool={this.props.scribing.selectedTool}
            onClick={this.onClickShapeMode}
            onMouseEnter={() => this.onMouseEnter(scribingTools.SHAPE)}
            onMouseLeave={this.onMouseLeave}
            colorBarComponent={() => (
              <div
                style={{
                  width: '23px',
                  height: '8px',
                  border: `${this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]} 2px solid`,
                  background: this.props.scribing.colors[scribingToolColor.SHAPE_FILL],
                }}
              />
            )}
            onTouchTapChevron={event => (this.onTouchTapPopover(event, scribingPopoverTypes.SHAPE))}
            iconClassname={
              this.props.scribing.selectedShape === scribingShapes.RECT ?
              'fa fa-square-o' : 'fa fa-circle-o'
            }
          />
          <ShapePopover
            lineToolType={scribingToolThickness.SHAPE_BORDER}
            open={this.state.popovers[scribingPopoverTypes.SHAPE]}
            anchorEl={this.state.popoverAnchor}
            onRequestClose={() => (this.onRequestClosePopover(scribingPopoverTypes.SHAPE))}
            currentShape={this.props.scribing.selectedShape}
            setSelectedShape={shape => (this.setSelectedShape(shape))}
            selectedLineStyle={this.props.scribing.lineStyles[scribingToolLineStyle.SHAPE_BORDER]}
            onTouchTapLineStyleChip={this.onTouchTapLineStyleChip}
            toolThicknessValue={this.props.scribing.thickness[scribingToolThickness.SHAPE_BORDER]}
            onChangeSliderThickness={(event, newValue) =>
              (this.onChangeSliderThickness(event, scribingToolThickness.SHAPE_BORDER, newValue))
            }
            borderColorPickerColor={this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]}
            onClickBorderColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.SHAPE_BORDER))}
            borderColorPickerPopoverOpen={this.state.colorDropdowns[scribingToolColor.SHAPE_BORDER]}
            borderColorPickerPopoverAnchorEl={this.state.popoverColorPickerAnchor}
            onRequestCloseBorderColorPickerPopover={
              () => (this.onRequestCloseColorPicker(scribingToolColor.SHAPE_BORDER))
            }
            onChangeCompleteBorderColorPicker={
              color => (this.onChangeCompleteColor(color, scribingToolColor.SHAPE_BORDER))
            }
            fillColorPickerColor={this.props.scribing.colors[scribingToolColor.SHAPE_FILL]}
            onClickFillColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.SHAPE_FILL))}
            fillColorPickerPopoverOpen={this.state.colorDropdowns[scribingToolColor.SHAPE_FILL]}
            fillColorPickerPopoverAnchorEl={this.state.popoverColorPickerAnchor}
            onRequestCloseFillColorPickerPopover={
              () => (this.onRequestCloseColorPicker(scribingToolColor.SHAPE_FILL))
            }
            onChangeCompleteFillColorPicker={
              color => (this.onChangeCompleteColor(color, scribingToolColor.SHAPE_FILL))
            }
          />
        </ToolbarGroup>
        <ToolbarGroup>
          <FontIcon
            className="fa fa-hand-pointer-o"
            style={this.props.scribing.selectedTool === scribingTools.SELECT ?
              { ...styles.tool, color: blue500 } : styles.tool}
            onClick={this.onClickSelectionMode}
            onMouseEnter={() => this.onMouseEnter(scribingTools.SELECT)}
            onMouseLeave={this.onMouseLeave}
            hoverColor={blue500}
          >
            <MaterialTooltip
              horizontalPosition={'center'}
              label={intl.formatMessage(translations.select)}
              show={this.state.hoveredToolTip === scribingTools.SELECT}
              verticalPosition={'top'}
            />
          </FontIcon>
          <LayersComponent
            onTouchTap={event => (this.onTouchTapPopover(event, scribingPopoverTypes.LAYER))}
            disabled={
              this.props.scribing.layers
              && this.props.scribing.layers.length === 0}
            open={this.state.popovers[scribingPopoverTypes.LAYER]}
            anchorEl={this.state.popoverAnchor}
            onRequestClose={() => (this.onRequestClosePopover(scribingPopoverTypes.LAYER))}
            layers={this.props.scribing.layers}
            onTouchTapLayer={(layer) => {
              this.props.scribing.layers.forEach((l) => {
                if (l.creator_id === layer.creator_id) {
                  const newDisplay = !l.isDisplayed;
                  this.props.setLayerDisplay(this.props.answerId, layer.creator_id, newDisplay);
                  l.showLayer(newDisplay);
                }
              });
            }}
          />
        </ToolbarGroup>
        <ToolbarGroup>
          <FontIcon
            className="fa fa-arrows"
            style={this.props.scribing.selectedTool === scribingTools.PAN ?
              { color: blue500 } : {}}
            onClick={this.onClickPanMode}
            onMouseEnter={() => this.onMouseEnter(scribingTools.PAN)}
            onMouseLeave={this.onMouseLeave}
            hoverColor={blue500}
          >
            <MaterialTooltip
              horizontalPosition={'center'}
              label={intl.formatMessage(translations.pan)}
              show={this.state.hoveredToolTip === scribingTools.PAN}
              verticalPosition={'top'}
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
              horizontalPosition={'center'}
              label={intl.formatMessage(translations.zoomIn)}
              show={this.state.hoveredToolTip === scribingTools.ZOOM_IN}
              verticalPosition={'top'}
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
              horizontalPosition={'center'}
              label={intl.formatMessage(translations.zoomOut)}
              show={this.state.hoveredToolTip === scribingTools.ZOOM_OUT}
              verticalPosition={'top'}
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
              horizontalPosition={'center'}
              label={intl.formatMessage(translations.delete)}
              show={this.state.hoveredToolTip === scribingTools.DELETE}
              verticalPosition={'top'}
            />
          </FontIcon>
        </ToolbarGroup>
        <ToolbarGroup>
          <SavingIndicator
            isSaving={this.props.scribing.isSaving}
            isSaved={this.props.scribing.isSaved}
            hasError={this.props.scribing.hasError}
            clearSavingStatus={() => this.props.clearSavingStatus(this.props.answerId)}
          />
        </ToolbarGroup>
      </Toolbar>
    );
  }
}

ScribingToolbar.propTypes = propTypes;
export default injectIntl(ScribingToolbar);
