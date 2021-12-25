import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Divider from 'material-ui/Divider';
import Menu from 'material-ui/Menu';
import Popover, { PopoverAnimationVertical } from 'material-ui/Popover';
import PropTypes from 'prop-types';

import { scribingTranslations as translations } from '../../../translations';
import ColorPickerField from '../fields/ColorPickerField';
import LineStyleField from '../fields/LineStyleField';
import LineThicknessField from '../fields/LineThicknessField';
import ShapeField from '../fields/ShapeField';

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
          onClickLineStyleChip={onClickLineStyleChip}
          selectedLineStyle={selectedLineStyle}
        />
        <LineThicknessField
          onChangeSliderThickness={onChangeSliderThickness}
          toolThicknessValue={toolThicknessValue}
        />
        <ColorPickerField
          colorPickerColor={borderColorPickerColor}
          colorPickerPopoverAnchorEl={borderColorPickerPopoverAnchorEl}
          colorPickerPopoverOpen={borderColorPickerPopoverOpen}
          onChangeCompleteColorPicker={onChangeCompleteBorderColorPicker}
          onClickColorPicker={onClickBorderColorPicker}
          onRequestCloseColorPickerPopover={
            onRequestCloseBorderColorPickerPopover
          }
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
          colorPickerColor={fillColorPickerColor}
          colorPickerPopoverAnchorEl={fillColorPickerPopoverAnchorEl}
          colorPickerPopoverOpen={fillColorPickerPopoverOpen}
          noFillOnCheck={noFillOnCheck}
          noFillValue={noFillValue}
          onChangeCompleteColorPicker={onChangeCompleteFillColorPicker}
          onClickColorPicker={onClickFillColorPicker}
          onRequestCloseColorPickerPopover={
            onRequestCloseFillColorPickerPopover
          }
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
        anchorEl={anchorEl}
        anchorOrigin={popoverStyles.anchorOrigin}
        animation={PopoverAnimationVertical}
        onRequestClose={onRequestClose}
        open={open}
        style={styles.toolDropdowns}
        targetOrigin={popoverStyles.targetOrigin}
      >
        <Menu style={styles.menu}>
          {displayShapeField ? this.renderShapeComponent() : undefined}
          {this.renderBorderComponent()}
          <Divider />
          {this.renderFillComponent()}
        </Menu>
      </Popover>
    );
  }
}

ShapePopover.propTypes = propTypes;
export default injectIntl(ShapePopover);
