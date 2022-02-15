import React from 'react';
import PropTypes from 'prop-types';
import Badge from 'material-ui/Badge';
import { IconButton, Tooltip } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import Close from '@material-ui/icons/Close';
import { FormattedMessage } from 'react-intl';
import translations from './translations';

const styles = {
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  badgeStyle: {
    backgroundColor: grey[400],
  },
};

export default class DeleteButton extends React.Component {
  renderIcon() {
    return (
      <Tooltip title={<FormattedMessage {...translations.removeFile} />}>
        <IconButton onClick={this.props.handleCancel}>
          <Close />
        </IconButton>
      </Tooltip>
    );
  }

  render() {
    return (
      <Badge
        badgeContent={this.renderIcon()}
        badgeStyle={styles.badgeStyle}
        style={styles.badge}
      />
    );
  }
}

DeleteButton.propTypes = {
  handleCancel: PropTypes.func,
};
