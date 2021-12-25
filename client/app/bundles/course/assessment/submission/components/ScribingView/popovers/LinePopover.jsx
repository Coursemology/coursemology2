import { injectIntl, intlShape } from 'react-intl';
import Menu from 'material-ui/Menu';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import PropTypes from 'prop-types';

import { scribingTranslations as translations } from '../../../translations';
import ColorPickerField from '../fields/ColorPickerField';
import LineStyleField from '../fields/LineStyleField';
import LineThicknessField from '../fields/LineThicknessField';

const propTypes = {
  intl: intlShape.isRequired,
  lineToolType: PropTypes.string,
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  onRequestClose: PropTypes.func,
  selectedLineStyle: PropTypes.string,
  onClickLineStyleChip: PropTypes.func,
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

const LinePopover = (props) => {
  const {
    intl,
    lineToolType,
    open,
    anchorEl,
    onRequestClose,
    selectedLineStyle,
    onClickLineStyleChip,
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
        <h4>{intl.formatMessage(translations.line)} </h4>
        <LineStyleField
          lineToolType={lineToolType}
          onClickLineStyleChip={onClickLineStyleChip}
          selectedLineStyle={selectedLineStyle}
        />
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

LinePopover.propTypes = propTypes;
export default injectIntl(LinePopover);
