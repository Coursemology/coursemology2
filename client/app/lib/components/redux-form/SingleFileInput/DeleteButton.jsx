import React from 'react';
import PropTypes from 'prop-types';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import { grey400 } from 'material-ui/styles/colors';
import { FormattedMessage } from 'react-intl';
import translations from './translations';

const styles = {
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  badgeStyle: {
    backgroundColor: grey400,
  },
};

export default class DeleteButton extends React.Component {
  renderIcon() {
    return (
      <IconButton
        tooltip={<FormattedMessage {...translations.removeFile} />}
        onClick={this.props.handleCancel}
      >
        <CloseIcon />
      </IconButton>
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
