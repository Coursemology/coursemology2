import { injectIntl } from 'react-intl';
import { Paper, Popover } from '@mui/material';
import PropTypes from 'prop-types';

import { scribingTranslations as translations } from '../../../translations';
import ColorPickerField from '../fields/ColorPickerField';
import LineThicknessField from '../fields/LineThicknessField';

const propTypes = {
  intl: PropTypes.object.isRequired,
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
      onClose={onRequestClose}
      open={open}
      style={styles.toolDropdowns}
      transformOrigin={popoverStyles.transformOrigin}
    >
      <Paper style={styles.paper}>
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
      </Paper>
    </Popover>
  );
};

DrawPopover.propTypes = propTypes;
export default injectIntl(DrawPopover);
