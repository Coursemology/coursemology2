import React from 'react';
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
    intl, lineToolType, open, anchorEl, onRequestClose,
    selectedLineStyle, onTouchTapLineStyleChip,
    toolThicknessValue, onChangeSliderThickness,
    colorPickerColor, onClickColorPicker, colorPickerPopoverOpen,
    colorPickerPopoverAnchorEl, onRequestCloseColorPickerPopover,
    onChangeCompleteColorPicker,
  } = props;

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
};

LinePopover.propTypes = propTypes;
export default injectIntl(LinePopover);
