import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import Popover from 'material-ui/Popover';
import RaisedButton from 'material-ui/RaisedButton';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Done from 'material-ui/svg-icons/action/done';
import { scribingTranslations as translations } from '../../translations';

const propTypes = {
  intl: intlShape.isRequired,
  onTouchTap: PropTypes.func,
  disabled: PropTypes.bool,
  open: PropTypes.bool,
  anchorEl: PropTypes.object,
  onRequestClose: PropTypes.func,
  layers: PropTypes.array,
  onTouchTapLayer: PropTypes.func,
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
    const {
      layers, open, anchorEl,
      onRequestClose, onTouchTapLayer,
    } = this.props;

    return layers && layers.length !== 0 ? (
      <Popover
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={popoverStyles.anchorOrigin}
        targetOrigin={popoverStyles.targetOrigin}
        onRequestClose={onRequestClose}
      >
        <Menu>
          { layers.map(layer => (
            <MenuItem
              key={layer.creator_id}
              primaryText={layer.creator_name}
              onTouchTap={() => (onTouchTapLayer(layer))}
              rightIcon={layer.isDisplayed ? <Done /> : null}
            />))
          }
        </Menu>
      </Popover>
    ) : null;
  }

  render() {
    const { intl, layers, onTouchTap, disabled } = this.props;

    return !disabled ?
      (<div>
        <label style={popoverStyles.layersLabel}>{intl.formatMessage(translations.layersLabelText)}</label>
        <RaisedButton
          onTouchTap={onTouchTap}
          label={layers && (`${layers[0].creator_name.substring(0, 6)}...`)}
          disabled={disabled}
        />
        { this.renderLayersPopover() }
      </div>) : null;
  }
}

LayersComponent.propTypes = propTypes;
export default injectIntl(LayersComponent);
