import { injectIntl, intlShape } from 'react-intl';
import Menu from 'material-ui/Menu';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import PropTypes from 'prop-types';

import { scribingTranslations as translations } from '../../../translations';
import ColorPickerField from '../fields/ColorPickerField';
import LineThicknessField from '../fields/LineThicknessField';

const propTypes = {
  intl: intlShape.isRequired,
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

const DrawPopover = (props) => {
  const {
    intl,
    open,
    anchorEl,
    onRequestClose,
    toolThicknessValue,
    onChangeSliderThickness,
    colorPickerColor,
    onClickColorPicker,
    colorPickerPopoverOpen,
    colorPickerPopoverAnchorEl,
    onRequestCloseColorPickerPopover,
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
        <h4>{intl.formatMessage(translations.pencil)} </h4>
        <LineThicknessField
          onChangeSliderThickness={onChangeSliderThickness}
          toolThicknessValue={toolThicknessValue}
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

DrawPopover.propTypes = propTypes;
export default injectIntl(DrawPopover);
