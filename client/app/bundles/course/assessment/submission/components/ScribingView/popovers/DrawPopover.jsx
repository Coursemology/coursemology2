import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Popover } from '@material-ui/core';
import { Paper } from '@mui/material';
import LineThicknessField from '../fields/LineThicknessField';
import ColorPickerField from '../fields/ColorPickerField';
import { scribingTranslations as translations } from '../../../translations';

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
      open={open}
      anchorEl={anchorEl}
      anchorOrigin={popoverStyles.anchorOrigin}
      onClose={onRequestClose}
      transformOrigin={popoverStyles.transformOrigin}
      style={styles.toolDropdowns}
    >
      <Paper style={styles.paper}>
        <h4>{intl.formatMessage(translations.pencil)} </h4>
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
      </Paper>
    </Popover>
  );
};

DrawPopover.propTypes = propTypes;
export default injectIntl(DrawPopover);
