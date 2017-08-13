import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { SketchPicker } from 'react-color';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  onClickColorPicker: PropTypes.func,
  colorPickerPopoverOpen: PropTypes.bool,
  colorPickerPopoverAnchorEl: PropTypes.object,
  onRequestCloseColorPickerPopover: PropTypes.func,
  colorPickerColor: PropTypes.string,
  onChangeCompleteColorPicker: PropTypes.func,
};

const styles = {
  colorPickerFieldDiv: {
    fontSize: '16px',
    lineHeight: '24px',
    width: '210px',
    display: 'block',
    position: 'relative',
    backgroundColor: 'transparent',
    fontFamily: 'Roboto, sans-serif',
    transition: 'height 200ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    cursor: 'auto',
  },
  label: {
    position: 'absolute',
    lineHeight: '22px',
    top: '38px',
    transition: 'all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
    zIndex: '1',
    transform: 'scale(0.75) translate(0px, -28px)',
    transformOrigin: 'left top 0px',
    pointerEvents: 'none',
    userSelect: 'none',
    color: 'rgba(0, 0, 0, 0.3)',
  },
  colorPicker: {
    height: '20px',
    width: '20px',
    display: 'inline-block',
    margin: '15px 0px 0px 50px',
    border: 'black 1px solid',
  },
  toolDropdowns: {
    padding: '10px',
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

const ColorPickerField = (props) => {
  const {
    intl, colorPickerColor, onClickColorPicker,
    colorPickerPopoverOpen, colorPickerPopoverAnchorEl,
    onRequestCloseColorPickerPopover,
    onChangeCompleteColorPicker,
  } = props;

  return (
    <div style={styles.colorPickerFieldDiv}>
      <label htmlFor="color-picker" style={styles.label}>{intl.formatMessage(translations.colour)}</label>
      <div
        role="button"
        tabIndex="0"
        style={{ background: colorPickerColor, ...styles.colorPicker }}
        onClick={onClickColorPicker}
      />
      <Popover
        style={styles.toolDropdowns}
        open={colorPickerPopoverOpen}
        anchorEl={colorPickerPopoverAnchorEl}
        anchorOrigin={popoverStyles.anchorOrigin}
        targetOrigin={popoverStyles.targetOrigin}
        onRequestClose={onRequestCloseColorPickerPopover}
        animation={PopoverAnimationVertical}
      >
        <SketchPicker
          color={colorPickerColor}
          onChangeComplete={onChangeCompleteColorPicker}
        />
      </Popover>
    </div>
  );
};

ColorPickerField.propTypes = propTypes;
export default injectIntl(ColorPickerField);
