import { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Paper, Popover } from '@material-ui/core';
import { Divider } from '@mui/material';
import LineStyleField from '../fields/LineStyleField';
import LineThicknessField from '../fields/LineThicknessField';
import ColorPickerField from '../fields/ColorPickerField';
import ShapeField from '../fields/ShapeField';
import { scribingTranslations as translations } from '../../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  lineToolType: PropTypes.string,
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  onRequestClose: PropTypes.func,
  displayShapeField: PropTypes.bool.isRequired,
  currentShape: PropTypes.string.isRequired,
  setSelectedShape: PropTypes.func,
  selectedLineStyle: PropTypes.string,
  onClickLineStyleChip: PropTypes.func,
  toolThicknessValue: PropTypes.number,
  onChangeSliderThickness: PropTypes.func,
  borderColorPickerColor: PropTypes.string,
  onClickBorderColorPicker: PropTypes.func,
  borderColorPickerPopoverOpen: PropTypes.bool,
  borderColorPickerPopoverAnchorEl: PropTypes.object,
  onRequestCloseBorderColorPickerPopover: PropTypes.func,
  onChangeCompleteBorderColorPicker: PropTypes.func,
  fillColorPickerColor: PropTypes.string,
  onClickFillColorPicker: PropTypes.func,
  fillColorPickerPopoverOpen: PropTypes.bool,
  fillColorPickerPopoverAnchorEl: PropTypes.object,
  noFillValue: PropTypes.bool,
  noFillOnCheck: PropTypes.func,
  onRequestCloseFillColorPickerPopover: PropTypes.func,
  onChangeCompleteFillColorPicker: PropTypes.func,
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

class ShapePopover extends Component {
  renderBorderComponent() {
    const {
      intl,
      lineToolType,
      selectedLineStyle,
      onClickLineStyleChip,
      toolThicknessValue,
      onChangeSliderThickness,
      onClickBorderColorPicker,
      borderColorPickerPopoverOpen,
      borderColorPickerPopoverAnchorEl,
      onRequestCloseBorderColorPickerPopover,
      borderColorPickerColor,
      onChangeCompleteBorderColorPicker,
    } = this.props;

    return (
      <>
        <h4>{intl.formatMessage(translations.border)}</h4>
        <LineStyleField
          lineToolType={lineToolType}
          selectedLineStyle={selectedLineStyle}
          onClickLineStyleChip={onClickLineStyleChip}
        />
        <LineThicknessField
          toolThicknessValue={toolThicknessValue}
          onChangeSliderThickness={onChangeSliderThickness}
        />
        <ColorPickerField
          onClickColorPicker={onClickBorderColorPicker}
          colorPickerPopoverOpen={borderColorPickerPopoverOpen}
          colorPickerPopoverAnchorEl={borderColorPickerPopoverAnchorEl}
          onRequestCloseColorPickerPopover={
            onRequestCloseBorderColorPickerPopover
          }
          colorPickerColor={borderColorPickerColor}
          onChangeCompleteColorPicker={onChangeCompleteBorderColorPicker}
        />
      </>
    );
  }

  renderFillComponent() {
    const {
      intl,
      onClickFillColorPicker,
      fillColorPickerPopoverOpen,
      fillColorPickerPopoverAnchorEl,
      onRequestCloseFillColorPickerPopover,
      fillColorPickerColor,
      onChangeCompleteFillColorPicker,
      noFillValue,
      noFillOnCheck,
    } = this.props;

    return (
      <>
        <h4>{intl.formatMessage(translations.fill)}</h4>
        <ColorPickerField
          onClickColorPicker={onClickFillColorPicker}
          colorPickerPopoverOpen={fillColorPickerPopoverOpen}
          colorPickerPopoverAnchorEl={fillColorPickerPopoverAnchorEl}
          onRequestCloseColorPickerPopover={
            onRequestCloseFillColorPickerPopover
          }
          colorPickerColor={fillColorPickerColor}
          onChangeCompleteColorPicker={onChangeCompleteFillColorPicker}
          noFillValue={noFillValue}
          noFillOnCheck={noFillOnCheck}
        />
      </>
    );
  }

  renderShapeComponent() {
    const { currentShape, setSelectedShape, intl } = this.props;

    return (
      <>
        <h4>{intl.formatMessage(translations.shape)}</h4>
        <ShapeField
          currentShape={currentShape}
          setSelectedShape={setSelectedShape}
        />
        <Divider />
      </>
    );
  }

  render() {
    const { open, displayShapeField, anchorEl, onRequestClose } = this.props;

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
          {displayShapeField ? this.renderShapeComponent() : undefined}
          {this.renderBorderComponent()}
          <Divider />
          {this.renderFillComponent()}
        </Paper>
      </Popover>
    );
  }
}

ShapePopover.propTypes = propTypes;
export default injectIntl(ShapePopover);
