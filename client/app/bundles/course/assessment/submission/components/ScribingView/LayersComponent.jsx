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
    const { intl, onTouchTap, disabled } = this.props;
    return (
      <div>
        <RaisedButton
          onTouchTap={onTouchTap}
          label={intl.formatMessage(translations.layers)}
          disabled={disabled}
        />
        { this.renderLayersPopover() }
      </div>
    );
  }
}

LayersComponent.propTypes = propTypes;
export default injectIntl(LayersComponent);
