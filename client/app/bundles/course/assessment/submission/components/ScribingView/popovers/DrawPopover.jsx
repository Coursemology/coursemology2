import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';

import LineThicknessField from '../fields/LineThicknessField';
import ColorPickerField from '../fields/ColorPickerField';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  activeObject: PropTypes.object,
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  onRequestClose: PropTypes.func,
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

class DrawPopover extends Component {
  renderActiveObjectMenu() {
    const {
      intl, activeObject, open, anchorEl, onRequestClose,
      onClickColorPicker, colorPickerPopoverOpen,
      colorPickerPopoverAnchorEl, onRequestCloseColorPickerPopover,
      setCanvasDirty, setCanvasSave, setToSelect,
    } = this.props;

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
            <h4>{intl.formatMessage(translations.pencil)} </h4>
          </div>
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
      intl, open, anchorEl, onRequestClose,
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
            <h4>{intl.formatMessage(translations.pencil)} </h4>
          </div>
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

DrawPopover.propTypes = propTypes;
export default injectIntl(DrawPopover);
