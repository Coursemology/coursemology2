import { Component } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import Done from 'material-ui/svg-icons/action/done';
import PropTypes from 'prop-types';

import { scribbleShape } from '../../propTypes';
import { scribingTranslations as translations } from '../../translations';

const propTypes = {
  intl: intlShape.isRequired,
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
  targetOrigin: {
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
        onRequestClose={onRequestClose}
        open={open}
        targetOrigin={popoverStyles.targetOrigin}
      >
        <Menu>
          {layers.map((layer) => (
            <MenuItem
              key={layer.creator_id}
              onClick={() => onClickLayer(layer)}
              primaryText={layer.creator_name}
              rightIcon={layer.isDisplayed ? <Done /> : null}
            />
          ))}
        </Menu>
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
        <RaisedButton
          disabled={disabled}
          label={layers && `${layers[0].creator_name.substring(0, 6)}...`}
          onClick={onClick}
        />
        {this.renderLayersPopover()}
      </>
    ) : null;
  }
}

LayersComponent.propTypes = propTypes;
export default injectIntl(LayersComponent);
