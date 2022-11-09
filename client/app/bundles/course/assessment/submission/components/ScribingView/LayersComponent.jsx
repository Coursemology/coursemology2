import { Component } from 'react';
import { injectIntl } from 'react-intl';
import Done from '@mui/icons-material/Done';
import { Button, MenuItem, MenuList, Popover } from '@mui/material';
import PropTypes from 'prop-types';

import { scribbleShape } from '../../propTypes';
import { scribingTranslations as translations } from '../../translations';

const propTypes = {
  intl: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  onRequestClose: PropTypes.func,
  layers: PropTypes.arrayOf(scribbleShape),
  onClickLayer: PropTypes.func,
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
  layersLabel: {
    lineHeight: '22px',
    top: '38px',
    zIndex: 1,
    pointerEvents: 'none',
    userSelect: 'none',
    color: 'rgba(0, 0, 0, 0.3)',
    padding: '10px',
  },
};

class LayersComponent extends Component {
  renderLayersPopover() {
    const { layers, open, anchorEl, onRequestClose, onClickLayer } = this.props;

    return layers && layers.length !== 0 ? (
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={popoverStyles.anchorOrigin}
        onClose={onRequestClose}
        open={open}
        transformOrigin={popoverStyles.transformOrigin}
      >
        <MenuList>
          {layers.map((layer) => (
            <MenuItem
              key={layer.creator_id}
              onClick={() => onClickLayer(layer)}
              style={{ display: 'flex', justifyContent: 'space-between' }}
            >
              {layer.creator_name}
              {layer.isDisplayed && <Done />}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    ) : null;
  }

  render() {
    const { intl, layers, onClick, disabled } = this.props;

    return !disabled ? (
      <>
        <label style={popoverStyles.layersLabel}>
          {intl.formatMessage(translations.layersLabelText)}
        </label>
        <Button disabled={disabled} onClick={onClick} variant="contained">
          {layers && `${layers[0].creator_name.substring(0, 6)}...`}
        </Button>
        {this.renderLayersPopover()}
      </>
    ) : null;
  }
}

LayersComponent.propTypes = propTypes;
export default injectIntl(LayersComponent);
