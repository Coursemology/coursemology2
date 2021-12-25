import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import Badge from 'material-ui/Badge';
import IconButton from 'material-ui/IconButton';
import { grey400 } from 'material-ui/styles/colors';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import PropTypes from 'prop-types';

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

export default class DeleteButton extends Component {
  renderIcon() {
    return (
      <IconButton
        onClick={this.props.handleCancel}
        tooltip={<FormattedMessage {...translations.removeFile} />}
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
