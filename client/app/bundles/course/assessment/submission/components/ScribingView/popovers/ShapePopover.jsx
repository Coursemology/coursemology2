import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import Divider from 'material-ui/Divider';

import LineStyleField from '../fields/LineStyleField';
import LineThicknessField from '../fields/LineThicknessField';
import ColorPickerField from '../fields/ColorPickerField';
import ShapeField from '../fields/ShapeField';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  lineToolType: PropTypes.string,
  activeObject: PropTypes.object,
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  onRequestClose: PropTypes.func,
  currentShape: PropTypes.string.isRequired,
  setSelectedShape: PropTypes.func,
  selectedLineStyle: PropTypes.string,
  onTouchTapLineStyleChip: PropTypes.func,
  toolThicknessValue: PropTypes.number,
  onChangeSliderThickness: PropTypes.func,
  borderColorPickerColor: PropTypes.string,
  onClickBorderColorPicker: PropTypes.func,
  borderColorPickerPopoverOpen: PropTypes.bool,
  borderColorPickerPopoverAnchorEl: PropTypes.object,
  onRequestCloseBorderColorPickerPopover: PropTypes.func,
  onChangeCompleteBorderColorPicker: PropTypes.func,
  fillColorPickerColor: PropTypes.string,
  onClickFillColorPicker: PropTypes.func,
  fillColorPickerPopoverOpen: PropTypes.bool,
  fillColorPickerPopoverAnchorEl: PropTypes.object,
  noFillValue: PropTypes.bool,
  noFillOnCheck: PropTypes.func,
  noFillLabel: PropTypes.string,
  onRequestCloseFillColorPickerPopover: PropTypes.func,
  onChangeCompleteFillColorPicker: PropTypes.func,
  setCanvasDirty: PropTypes.func,
  setCanvasSave: PropTypes.func,
  setToSelect: PropTypes.func,
};

const styles = {
  toolDropdowns: {
    padding: '10px',
  },
  menu: {
    padding: '5px',
    maxHeight: '250px',
    overflowY: 'auto',
  },
};

const popoverStyles = {
  anchorOrigin: {
    horizontal: 'left',
    vertical: 'bottom',
  },
  targetOrigin: {
    horizontal: 'left',
    vertical: 'top',
  },
};

class ShapePopover extends Component {
  renderShapeComponent() {
    const { currentShape, setSelectedShape, intl } = this.props;

    return (
      <div>
        <div>
          <h4>{intl.formatMessage(translations.shape)} </h4>
        </div>
        <ShapeField currentShape={currentShape} setSelectedShape={setSelectedShape} />
      </div>
    );
  }

  renderBorderComponent() {
    const {
      intl, lineToolType, selectedLineStyle, onTouchTapLineStyleChip,
      toolThicknessValue, onChangeSliderThickness, onClickBorderColorPicker,
      borderColorPickerPopoverOpen, borderColorPickerPopoverAnchorEl,
      onRequestCloseBorderColorPickerPopover, borderColorPickerColor,
      onChangeCompleteBorderColorPicker,
    } = this.props;

    return (
      <div>
        <div>
          <h4>{intl.formatMessage(translations.border)}</h4>
        </div>
        <LineStyleField
          lineToolType={lineToolType}
          selectedLineStyle={selectedLineStyle}
          onTouchTapLineStyleChip={onTouchTapLineStyleChip}
        />
        <LineThicknessField
          toolThicknessValue={toolThicknessValue}
          onChangeSliderThickness={onChangeSliderThickness}
        />
        <ColorPickerField
          onClickColorPicker={onClickBorderColorPicker}
          colorPickerPopoverOpen={borderColorPickerPopoverOpen}
          colorPickerPopoverAnchorEl={borderColorPickerPopoverAnchorEl}
          onRequestCloseColorPickerPopover={onRequestCloseBorderColorPickerPopover}
          colorPickerColor={borderColorPickerColor}
          onChangeCompleteColorPicker={onChangeCompleteBorderColorPicker}
        />
      </div>
    );
  }

  renderFillComponent() {
    const {
      intl, onClickFillColorPicker, fillColorPickerPopoverOpen,
      fillColorPickerPopoverAnchorEl, onRequestCloseFillColorPickerPopover,
      fillColorPickerColor, onChangeCompleteFillColorPicker,
    } = this.props;

    return (
      <div>
        <div>
          <h4>{intl.formatMessage(translations.fill)}</h4>
        </div>
        <ColorPickerField
          onClickColorPicker={onClickFillColorPicker}
          colorPickerPopoverOpen={fillColorPickerPopoverOpen}
          colorPickerPopoverAnchorEl={fillColorPickerPopoverAnchorEl}
          onRequestCloseColorPickerPopover={onRequestCloseFillColorPickerPopover}
          colorPickerColor={fillColorPickerColor}
          onChangeCompleteColorPicker={onChangeCompleteFillColorPicker}
        />
      </div>
    );
  }

  renderMenu() {
    const { open, anchorEl, onRequestClose } = this.props;

    return (
      <Popover
        style={styles.toolDropdowns}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={popoverStyles.anchorOrigin}
        targetOrigin={popoverStyles.targetOrigin}
        onRequestClose={onRequestClose}
        animation={PopoverAnimationVertical}
      >
        <Menu style={styles.menu}>
          { this.renderShapeComponent() }
          <Divider />
          { this.renderBorderComponent() }
          <Divider />
          { this.renderFillComponent() }
        </Menu>
      </Popover>
    );
  }

  renderActiveObjectBorderComponent() {
    const {
      intl, activeObject, lineToolType, onClickBorderColorPicker,
      borderColorPickerPopoverOpen, borderColorPickerPopoverAnchorEl,
      onRequestCloseBorderColorPickerPopover, setCanvasDirty,
    } = this.props;

    let lineStyle;
    if (activeObject.strokeDashArray[0] === 1 && activeObject.strokeDashArray[1] === 3) {
      lineStyle = 'dotted';
    } else if (activeObject.strokeDashArray[0] === 10 && activeObject.strokeDashArray[1] === 5) {
      lineStyle = 'dashed';
    } else {
      lineStyle = 'solid';
    }

    return (
      <div>
        <div>
          <h4>{intl.formatMessage(translations.border)}</h4>
        </div>
        <LineStyleField
          lineToolType={lineToolType}
          selectedLineStyle={lineStyle}
          onTouchTapLineStyleChip={(_, __, style) => {
            let strokeDashArray = [];
            if (style === 'dotted') {
              strokeDashArray = [1, 3];
            } else if (style === 'dashed') {
              strokeDashArray = [10, 5];
            }
            activeObject.set({ strokeDashArray });
            this.props.setCanvasDirty();
          }}
        />
        <LineThicknessField
          toolThicknessValue={activeObject.strokeWidth}
          onChangeSliderThickness={(event, newValue) => {
            activeObject.set({ strokeWidth: newValue });
            setCanvasDirty();
          }}
        />
        <ColorPickerField
          onClickColorPicker={onClickBorderColorPicker}
          colorPickerPopoverOpen={borderColorPickerPopoverOpen}
          colorPickerPopoverAnchorEl={borderColorPickerPopoverAnchorEl}
          onRequestCloseColorPickerPopover={onRequestCloseBorderColorPickerPopover}
          colorPickerColor={activeObject.stroke}
          onChangeCompleteColorPicker={(color) => {
            activeObject.set({ stroke: color });
            setCanvasDirty();
            onRequestCloseBorderColorPickerPopover();
          }}
        />
      </div>
    );
  }

  renderActiveObjectFillComponent() {
    const {
      intl, activeObject, onClickFillColorPicker, fillColorPickerPopoverOpen,
      fillColorPickerPopoverAnchorEl, onRequestCloseFillColorPickerPopover,
      setCanvasDirty, noFillValue, noFillOnCheck, noFillLabel,
    } = this.props;

    return (
      <div>
        <div>
          <h4>{intl.formatMessage(translations.fill)}</h4>
        </div>
        <ColorPickerField
          noFillValue={noFillValue}
          noFillOnCheck={noFillOnCheck}
          noFillLabel={noFillLabel}
          onClickColorPicker={onClickFillColorPicker}
          colorPickerPopoverOpen={fillColorPickerPopoverOpen}
          colorPickerPopoverAnchorEl={fillColorPickerPopoverAnchorEl}
          onRequestCloseColorPickerPopover={onRequestCloseFillColorPickerPopover}
          colorPickerColor={activeObject.fill}
          onChangeCompleteColorPicker={(color) => {
            activeObject.set({ fill: color });
            setCanvasDirty();
            onRequestCloseFillColorPickerPopover();
          }}
        />
      </div>
    );
  }

  renderActiveObjectMenu() {
    const { open, anchorEl, onRequestClose, setCanvasSave, setToSelect } = this.props;

    return (
      <Popover
        style={styles.toolDropdowns}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={popoverStyles.anchorOrigin}
        targetOrigin={popoverStyles.targetOrigin}
        onRequestClose={() => {
          setCanvasSave();
          setToSelect();
          onRequestClose();
        }}
        animation={PopoverAnimationVertical}
      >
        <Menu style={styles.menu}>
          { this.renderActiveObjectBorderComponent() }
          <Divider />
          { this.renderActiveObjectFillComponent() }
        </Menu>
      </Popover>
    );
  }

  render() {
    return this.props.activeObject ? this.renderActiveObjectMenu() : this.renderMenu();
  }
}

ShapePopover.propTypes = propTypes;
export default injectIntl(ShapePopover);
