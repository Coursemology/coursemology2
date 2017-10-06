import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';

import LineStyleField from '../fields/LineStyleField';
import LineThicknessField from '../fields/LineThicknessField';
import ColorPickerField from '../fields/ColorPickerField';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  lineToolType: PropTypes.string,
  activeObject: PropTypes.object,
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  onRequestClose: PropTypes.func,
  selectedLineStyle: PropTypes.string,
  onTouchTapLineStyleChip: PropTypes.func,
  toolThicknessValue: PropTypes.number,
  onChangeSliderThickness: PropTypes.func,
  colorPickerColor: PropTypes.string,
  onClickColorPicker: PropTypes.func,
  colorPickerPopoverOpen: PropTypes.bool,
  colorPickerPopoverAnchorEl: PropTypes.object,
  onRequestCloseColorPickerPopover: PropTypes.func,
  onChangeCompleteColorPicker: PropTypes.func,
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

class LinePopover extends Component {
  renderActiveObjectMenu() {
    const {
      intl, activeObject, lineToolType, open, anchorEl, onRequestClose,
      onClickColorPicker, colorPickerPopoverOpen,
      colorPickerPopoverAnchorEl, onRequestCloseColorPickerPopover,
      setCanvasDirty, setCanvasSave, setToSelect,
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
          <div>
            <h4>{intl.formatMessage(translations.line)}</h4>
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
            onClickColorPicker={onClickColorPicker}
            colorPickerPopoverOpen={colorPickerPopoverOpen}
            colorPickerPopoverAnchorEl={colorPickerPopoverAnchorEl}
            onRequestCloseColorPickerPopover={onRequestCloseColorPickerPopover}
            colorPickerColor={activeObject.stroke}
            onChangeCompleteColorPicker={(color) => {
              activeObject.set({ stroke: color });
              setCanvasDirty();
              onRequestCloseColorPickerPopover();
            }}
          />
        </Menu>
      </Popover>
    );
  }

  renderMenu() {
    const {
      intl, lineToolType, open, anchorEl, onRequestClose,
      selectedLineStyle, onTouchTapLineStyleChip,
      toolThicknessValue, onChangeSliderThickness,
      colorPickerColor, onClickColorPicker, colorPickerPopoverOpen,
      colorPickerPopoverAnchorEl, onRequestCloseColorPickerPopover,
      onChangeCompleteColorPicker,
    } = this.props;

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
          <div>
            <h4>{intl.formatMessage(translations.line)} </h4>
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
            onClickColorPicker={onClickColorPicker}
            colorPickerPopoverOpen={colorPickerPopoverOpen}
            colorPickerPopoverAnchorEl={colorPickerPopoverAnchorEl}
            onRequestCloseColorPickerPopover={onRequestCloseColorPickerPopover}
            colorPickerColor={colorPickerColor}
            onChangeCompleteColorPicker={onChangeCompleteColorPicker}
          />
        </Menu>
      </Popover>
    );
  }

  render() {
    return this.props.activeObject ? this.renderActiveObjectMenu() : this.renderMenu();
  }
}

LinePopover.propTypes = propTypes;
export default injectIntl(LinePopover);
