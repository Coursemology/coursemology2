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
  openHoverToolTip: PropTypes.func.isRequired,
  closeHoverToolTip: PropTypes.func.isRequired,
  openColorPicker: PropTypes.func.isRequired,
  closeColorPicker: PropTypes.func.isRequired,
  openPopover: PropTypes.func.isRequired,
  closePopover: PropTypes.func.isRequired,
  clearSavingStatus: PropTypes.func.isRequired,
};

const styles = {
  cover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },
  canvas_div: {
    alignItems: 'center',
    margin: 'auto',
  },
  canvas: {
    width: '100%',
    border: '1px solid black',
  },
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
  custom_line: {
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

class ScribingToolbar extends Component {

  // Toolbar Event handlers

  onChangeCompleteColor = (color, coloringTool) => {
    if (coloringTool === scribingToolColor.DRAW) {
      this.props.scribing.canvas.freeDrawingBrush.color = this.getRgbaHelper(color.rgb);
    }
    this.props.setColoringToolColor(this.props.answerId, coloringTool, this.getRgbaHelper(color.rgb));
    this.props.closeColorPicker(this.props.answerId, coloringTool);
  }

  onChangeFontFamily = (event, index, value) => (
    this.props.setFontFamily(this.props.answerId, value)
  )

  onChangeFontSize = (event, index, value) => (
    this.props.setFontSize(this.props.answerId, value)
  )

  onClickColorPicker = (event, toolType) => {
    // This prevents ghost click.
    event.preventDefault();
    this.props.openColorPicker(this.props.answerId, toolType, event.currentTarget);
  }

  onRequestCloseColorPicker = (toolType) => {
    this.props.closeColorPicker(this.props.answerId, toolType);
  }

  onTouchTapPopover = (event, popoverType) => {
    // This prevents ghost click.
    event.preventDefault();
    const popoverAnchor = popoverType === scribingPopoverTypes.LAYER ?
            event.currentTarget :
            event.currentTarget.parentElement.parentElement;
    this.props.openPopover(this.props.answerId, popoverType, popoverAnchor);
  }

  onRequestClosePopover = (popoverType) => {
    this.props.closePopover(this.props.answerId, popoverType);
  }

  onTouchTapLineStyleChip = (event, toolType, style) => {
    // This prevents ghost click.
    event.preventDefault();
    this.props.setLineStyleChip(this.props.answerId, toolType, style);
  }

  onChangeSliderThickness = (event, toolType, value) => {
    if (toolType === scribingToolThickness.DRAW) {
      this.props.scribing.canvas.freeDrawingBrush.width = value;
    }
    this.props.setToolThickness(this.props.answerId, toolType, value);
  }

  onClickTypingMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.TYPE);
    this.props.scribing.canvas.isDrawingMode = false;
    this.props.scribing.canvas.defaultCursor = 'pointer';
    this.enableTextSelection();
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
    this.props.scribing.canvas.isDrawingMode = true;
  }

  onClickLineMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.LINE);
    this.props.scribing.canvas.isDrawingMode = false;
    this.props.scribing.canvas.defaultCursor = 'crosshair';
    this.disableObjectSelection();
  }

  onClickShapeMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.SHAPE);
    this.props.scribing.canvas.isDrawingMode = false;
    this.props.scribing.canvas.defaultCursor = 'crosshair';
    this.disableObjectSelection();
  }

  onClickSelectionMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.SELECT);
    this.props.scribing.canvas.isDrawingMode = false;
    this.props.scribing.canvas.defaultCursor = 'pointer';
    this.enableObjectSelection();
  }

  onClickPanMode = () => {
    this.props.setToolSelected(this.props.answerId, scribingTools.PAN);
    this.props.scribing.canvas.isDrawingMode = false;
    this.props.scribing.canvas.defaultCursor = 'move';
    this.disableObjectSelection();
  }

  onClickZoomIn = () => {
    const newZoom = this.props.scribing.canvas.getZoom() + 0.1;
    this.props.scribing.canvas.zoomToPoint({
      x: this.props.scribing.canvas.height / 2,
      y: this.props.scribing.canvas.width / 2,
    }, newZoom);
  }

  onClickZoomOut = () => {
    const newZoom = Math.max(this.props.scribing.canvas.getZoom() - 0.1, 1);
    this.props.scribing.canvas.zoomToPoint({
      x: this.props.scribing.canvas.height / 2,
      y: this.props.scribing.canvas.width / 2,
    }, newZoom);
    this.props.scribing.canvas.trigger('mouse:move', { isForced: true });
  }

  onClickDelete = () => {
    const activeGroup = this.props.scribing.canvas.getActiveGroup();
    const activeObject = this.props.scribing.canvas.getActiveObject();

    if (activeObject) {
      this.props.scribing.canvas.remove(activeObject);
    } else if (activeGroup) {
      const objectsInGroup = activeGroup.getObjects();
      this.props.scribing.canvas.discardActiveGroup();
      objectsInGroup.forEach(object => (this.props.scribing.canvas.remove(object)));
    }
    this.props.scribing.canvas.renderAll();
  }

  onMouseEnter(toolType) {
    this.props.openHoverToolTip(this.props.answerId, toolType);
  }

  onMouseLeave = () => {
    this.props.closeHoverToolTip(this.props.answerId);
  }

  // Helpers

  // Function Helpers
  getRgbaHelper = json => (
    `rgba(${json.r},${json.g},${json.b},${json.a})`
  );

  disableObjectSelection() {
    this.props.scribing.canvas.forEachObject(object => (
      object.selectable = false // eslint-disable-line no-param-reassign
    ));
  }

  // This method only enable selection for interactive texts
  enableTextSelection() {
    this.props.scribing.canvas.clear();
    this.props.scribing.canvas.initializeScribblesAndBackground(false);
    this.props.scribing.canvas.forEachObject(object => (
      // eslint-disable-next-line no-param-reassign
      object.selectable = (object.type === 'i-text')
    ));
  }

  // This method clears the selection-disabled scribbles
  // and reloads them to enable selection again
  enableObjectSelection() {
    this.props.scribing.canvas.clear();
    this.props.scribing.canvas.initializeScribblesAndBackground(false);
  }

  setSelectedShape = (shape) => {
    this.props.setSelectedShape(this.props.answerId, shape);
  }

  render() {
    const { intl, scribing } = this.props;
    const lineToolStyle = {
      ...styles.custom_line,
      background: this.props.scribing.selectedTool === scribingTools.LINE ? blue500 : 'rgba(0, 0, 0, 0.4)',
    };
    const toolBarStyle = !scribing.isCanvasLoaded ? styles.disabledToolbar : styles.toolBar;

    return (
      <Toolbar
        style={{
          ...toolBarStyle,
          width: this.props.scribing.canvas && this.props.scribing.canvas.maxWidth,
        }}
      >
        <ToolbarGroup>
          <ToolDropdown
            toolType={scribingTools.TYPE}
            tooltip={intl.formatMessage(translations.text)}
            showTooltip={this.props.scribing.hoveredToolTip === scribingTools.TYPE}
            currentTool={this.props.scribing.selectedTool}
            onClickIcon={this.onClickTypingIcon}
            colorBar={this.props.scribing.colors[scribingToolColor.TYPE]}
            onTouchTapChevron={this.onClickTypingChevron}
            iconClassname="fa fa-font"
            onMouseEnter={() => this.onMouseEnter(scribingTools.TYPE)}
            onMouseLeave={this.onMouseLeave}
            popoverComponent={() => (
              <TypePopover
                open={this.props.scribing.popovers[scribingPopoverTypes.TYPE]}
                anchorEl={this.props.scribing.popoverAnchor}
                onRequestClose={() => (this.onRequestClosePopover(scribingPopoverTypes.TYPE))}
                fontFamilyValue={this.props.scribing.fontFamily}
                onChangeFontFamily={this.onChangeFontFamily}
                fontSizeValue={this.props.scribing.fontSize}
                onChangeFontSize={this.onChangeFontSize}
                onClickColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.TYPE))}
                colorPickerPopoverOpen={this.props.scribing.colorDropdowns[scribingToolColor.TYPE]}
                colorPickerPopoverAnchorEl={this.props.scribing.popoverColorPickerAnchor}
                onRequestCloseColorPickerPopover={() => (this.onRequestCloseColorPicker(scribingToolColor.TYPE))}
                colorPickerColor={this.props.scribing.colors[scribingToolColor.TYPE]}
                onChangeCompleteColorPicker={color => (this.onChangeCompleteColor(color, scribingToolColor.TYPE))}
              />)}
          />
          <ToolDropdown
            toolType={scribingTools.DRAW}
            tooltip={intl.formatMessage(translations.pencil)}
            showTooltip={this.props.scribing.hoveredToolTip === scribingTools.DRAW}
            currentTool={this.props.scribing.selectedTool}
            onClick={this.onClickDrawingMode}
            colorBar={this.props.scribing.colors[scribingToolColor.DRAW]}
            onTouchTapChevron={event => (this.onTouchTapPopover(event, scribingPopoverTypes.DRAW))}
            iconClassname="fa fa-pencil"
            onMouseEnter={() => this.onMouseEnter(scribingTools.DRAW)}
            onMouseLeave={this.onMouseLeave}
            popoverComponent={() => (
              <DrawPopover
                open={this.props.scribing.popovers[scribingPopoverTypes.DRAW]}
                anchorEl={this.props.scribing.popoverAnchor}
                onRequestClose={() => (this.onRequestClosePopover(scribingPopoverTypes.DRAW))}
                toolThicknessValue={this.props.scribing.thickness[scribingToolThickness.DRAW]}
                onChangeSliderThickness={(event, newValue) =>
                  (this.onChangeSliderThickness(event, scribingToolThickness.DRAW, newValue))
                }
                colorPickerColor={this.props.scribing.colors[scribingToolColor.DRAW]}
                onClickColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.DRAW))}
                colorPickerPopoverOpen={this.props.scribing.colorDropdowns[scribingToolColor.DRAW]}
                colorPickerPopoverAnchorEl={this.props.scribing.popoverColorPickerAnchor}
                onRequestCloseColorPickerPopover={() => (this.onRequestCloseColorPicker(scribingToolColor.DRAW))}
                onChangeCompleteColorPicker={color => (this.onChangeCompleteColor(color, scribingToolColor.DRAW))}
              />
            )}
          />
          <ToolDropdown
            toolType={scribingTools.LINE}
            tooltip={intl.formatMessage(translations.line)}
            showTooltip={this.props.scribing.hoveredToolTip === scribingTools.LINE}
            currentTool={this.props.scribing.selectedTool}
            onClick={this.onClickLineMode}
            colorBar={this.props.scribing.colors[scribingToolColor.LINE]}
            onTouchTapChevron={event => (this.onTouchTapPopover(event, scribingPopoverTypes.LINE))}
            iconComponent={() => (<div style={lineToolStyle} />)}
            onMouseEnter={() => this.onMouseEnter(scribingTools.LINE)}
            onMouseLeave={this.onMouseLeave}
            popoverComponent={() => (
              <LinePopover
                lineToolType={scribingToolThickness.LINE}
                open={this.props.scribing.popovers[scribingPopoverTypes.LINE]}
                anchorEl={this.props.scribing.popoverAnchor}
                onRequestClose={() => (this.onRequestClosePopover(scribingPopoverTypes.LINE))}
                selectedLineStyle={this.props.scribing.lineStyles[scribingToolLineStyle.LINE]}
                onTouchTapLineStyleChip={this.onTouchTapLineStyleChip}
                toolThicknessValue={this.props.scribing.thickness[scribingToolThickness.LINE]}
                onChangeSliderThickness={(event, newValue) =>
                  (this.onChangeSliderThickness(event, scribingToolThickness.LINE, newValue))
                }
                colorPickerColor={this.props.scribing.colors[scribingToolColor.LINE]}
                onClickColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.LINE))}
                colorPickerPopoverOpen={this.props.scribing.colorDropdowns[scribingToolColor.LINE]}
                colorPickerPopoverAnchorEl={this.props.scribing.popoverColorPickerAnchor}
                onRequestCloseColorPickerPopover={() => (this.onRequestCloseColorPicker(scribingToolColor.LINE))}
                onChangeCompleteColorPicker={color => (this.onChangeCompleteColor(color, scribingToolColor.LINE))}
              />
            )}
          />
          <ToolDropdown
            toolType={scribingTools.SHAPE}
            tooltip={intl.formatMessage(translations.shape)}
            showTooltip={this.props.scribing.hoveredToolTip === scribingTools.SHAPE}
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
            popoverComponent={() => (
              <ShapePopover
                lineToolType={scribingToolThickness.SHAPE_BORDER}
                open={this.props.scribing.popovers[scribingPopoverTypes.SHAPE]}
                anchorEl={this.props.scribing.popoverAnchor}
                onRequestClose={() => (this.onRequestClosePopover(scribingPopoverTypes.SHAPE))}
                setSelectedShape={shape => (this.setSelectedShape(shape))}
                selectedLineStyle={this.props.scribing.lineStyles[scribingToolLineStyle.SHAPE_BORDER]}
                onTouchTapLineStyleChip={this.onTouchTapLineStyleChip}
                toolThicknessValue={this.props.scribing.thickness[scribingToolThickness.SHAPE_BORDER]}
                onChangeSliderThickness={(event, newValue) =>
                  (this.onChangeSliderThickness(event, scribingToolThickness.SHAPE_BORDER, newValue))
                }
                borderColorPickerColor={this.props.scribing.colors[scribingToolColor.SHAPE_BORDER]}
                onClickBorderColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.SHAPE_BORDER))}
                borderColorPickerPopoverOpen={this.props.scribing.colorDropdowns[scribingToolColor.SHAPE_BORDER]}
                borderColorPickerPopoverAnchorEl={this.props.scribing.popoverColorPickerAnchor}
                onRequestCloseBorderColorPickerPopover={
                  () => (this.onRequestCloseColorPicker(scribingToolColor.SHAPE_BORDER))
                }
                onChangeCompleteBorderColorPicker={
                  color => (this.onChangeCompleteColor(color, scribingToolColor.SHAPE_BORDER))
                }
                fillColorPickerColor={this.props.scribing.colors[scribingToolColor.SHAPE_FILL]}
                onClickFillColorPicker={event => (this.onClickColorPicker(event, scribingToolColor.SHAPE_FILL))}
                fillColorPickerPopoverOpen={this.props.scribing.colorDropdowns[scribingToolColor.SHAPE_FILL]}
                fillColorPickerPopoverAnchorEl={this.props.scribing.popoverColorPickerAnchor}
                onRequestCloseFillColorPickerPopover={
                  () => (this.onRequestCloseColorPicker(scribingToolColor.SHAPE_FILL))
                }
                onChangeCompleteFillColorPicker={
                  color => (this.onChangeCompleteColor(color, scribingToolColor.SHAPE_FILL))
                }
              />
            )}
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
              show={this.props.scribing.hoveredToolTip === scribingTools.SELECT}
              verticalPosition={'top'}
            />
          </FontIcon>
          <LayersComponent
            onTouchTap={event => (this.onTouchTapPopover(event, scribingPopoverTypes.LAYER))}
            disabled={
              this.props.scribing.layers
              && this.props.scribing.layers.length === 0}
            open={this.props.scribing.popovers[scribingPopoverTypes.LAYER]}
            anchorEl={this.props.scribing.popoverAnchor}
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
              show={this.props.scribing.hoveredToolTip === scribingTools.PAN}
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
              show={this.props.scribing.hoveredToolTip === scribingTools.ZOOM_IN}
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
              show={this.props.scribing.hoveredToolTip === scribingTools.ZOOM_OUT}
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
              show={this.props.scribing.hoveredToolTip === scribingTools.DELETE}
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
