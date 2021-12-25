import { injectIntl, intlShape } from 'react-intl';
import Menu from 'material-ui/Menu';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import PropTypes from 'prop-types';

import { scribingTranslations as translations } from '../../../translations';
import ColorPickerField from '../fields/ColorPickerField';
import FontFamilyField from '../fields/FontFamilyField';
import FontSizeField from '../fields/FontSizeField';

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
      anchorEl={anchorEl}
      anchorOrigin={popoverStyles.anchorOrigin}
      animation={PopoverAnimationVertical}
      onRequestClose={onRequestClose}
      open={open}
      style={styles.toolDropdowns}
      targetOrigin={popoverStyles.targetOrigin}
    >
      <Menu style={styles.menu}>
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
          colorPickerColor={colorPickerColor}
          colorPickerPopoverAnchorEl={colorPickerPopoverAnchorEl}
          colorPickerPopoverOpen={colorPickerPopoverOpen}
          onChangeCompleteColorPicker={onChangeCompleteColorPicker}
          onClickColorPicker={onClickColorPicker}
          onRequestCloseColorPickerPopover={onRequestCloseColorPickerPopover}
        />
      </Menu>
    </Popover>
  );
};

TypePopover.propTypes = propTypes;
export default injectIntl(TypePopover);
