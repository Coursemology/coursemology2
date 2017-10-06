import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import Menu from 'material-ui/Menu';

import FontFamilyField from '../fields/FontFamilyField';
import FontSizeField from '../fields/FontSizeField';
import ColorPickerField from '../fields/ColorPickerField';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  activeObject: PropTypes.object,
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  onRequestClose: PropTypes.func,
  fontFamilyValue: PropTypes.string,
  onChangeFontFamily: PropTypes.func,
  fontSizeValue: PropTypes.number,
  onChangeFontSize: PropTypes.func,
  onClickColorPicker: PropTypes.func,
  colorPickerPopoverOpen: PropTypes.bool,
  colorPickerPopoverAnchorEl: PropTypes.object,
  onRequestCloseColorPickerPopover: PropTypes.func,
  colorPickerColor: PropTypes.string,
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

class TypePopover extends Component {
  renderActiveObjectMenu() {
    const {
      intl, activeObject, open, anchorEl, onRequestClose,
      onClickColorPicker, colorPickerPopoverOpen, colorPickerPopoverAnchorEl,
      onRequestCloseColorPickerPopover, setCanvasDirty, setCanvasSave, setToSelect,
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
            <h4>{intl.formatMessage(translations.text)}</h4>
          </div>
          <FontFamilyField
            fontFamilyValue={activeObject.fontFamily}
            onChangeFontFamily={(_, __, value) => {
              activeObject.set({ fontFamily: value });
              this.props.setCanvasDirty();
            }}
          />
          <FontSizeField
            fontSizeValue={activeObject.fontSize}
            onChangeFontSize={(_, __, value) => {
              activeObject.set({ fontSize: value });
              this.props.setCanvasDirty();
            }}
          />
          <ColorPickerField
            onClickColorPicker={onClickColorPicker}
            colorPickerPopoverOpen={colorPickerPopoverOpen}
            colorPickerPopoverAnchorEl={colorPickerPopoverAnchorEl}
            onRequestCloseColorPickerPopover={onRequestCloseColorPickerPopover}
            colorPickerColor={activeObject.fill}
            onChangeCompleteColorPicker={(color) => {
              activeObject.set({ fill: color });
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
      intl, open, anchorEl, onRequestClose, fontFamilyValue, onChangeFontFamily, fontSizeValue,
      onChangeFontSize, onClickColorPicker, colorPickerPopoverOpen, colorPickerPopoverAnchorEl,
      onRequestCloseColorPickerPopover, colorPickerColor, onChangeCompleteColorPicker,
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
            <h4>{intl.formatMessage(translations.text)}</h4>
          </div>
          <FontFamilyField
            fontFamilyValue={fontFamilyValue}
            onChangeFontFamily={onChangeFontFamily}
          />
          <FontSizeField
            fontSizeValue={fontSizeValue}
            onChangeFontSize={onChangeFontSize}
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

TypePopover.propTypes = propTypes;
export default injectIntl(TypePopover);
