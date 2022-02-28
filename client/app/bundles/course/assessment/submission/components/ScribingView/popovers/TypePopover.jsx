import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Paper, Popover } from '@material-ui/core';
import FontFamilyField from '../fields/FontFamilyField';
import FontSizeField from '../fields/FontSizeField';
import ColorPickerField from '../fields/ColorPickerField';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
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
};

const styles = {
  toolDropdowns: {
    padding: '10px',
  },
  paper: {
    padding: '10px',
    maxHeight: '250px',
    overflowY: 'auto',
  },
};

const popoverStyles = {
  anchorOrigin: {
    horizontal: 'left',
    vertical: 'bottom',
  },
  transformOrigin: {
    horizontal: 'left',
    vertical: 'top',
  },
};

const TypePopover = (props) => {
  const {
    intl,
    open,
    anchorEl,
    onRequestClose,
    fontFamilyValue,
    onChangeFontFamily,
    fontSizeValue,
    onChangeFontSize,
    onClickColorPicker,
    colorPickerPopoverOpen,
    colorPickerPopoverAnchorEl,
    onRequestCloseColorPickerPopover,
    colorPickerColor,
    onChangeCompleteColorPicker,
  } = props;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={popoverStyles.anchorOrigin}
      onClose={onRequestClose}
      transformOrigin={popoverStyles.transformOrigin}
      style={styles.toolDropdowns}
    >
      <Paper style={styles.paper}>
        <h4>{intl.formatMessage(translations.text)}</h4>
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
      </Paper>
    </Popover>
  );
};

TypePopover.propTypes = propTypes;
export default injectIntl(TypePopover);
