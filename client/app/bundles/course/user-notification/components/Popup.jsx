import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import { Button } from '@material-ui/core';
import translations from 'lib/translations/form';

const styles = {
  dialog: {
    width: 400,
  },
  centralise: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
};

class Popup extends React.Component {
  render() {
    const { title, children, actionButtons, onDismiss } = this.props;
    const dismissButton = (
      <Button color="primary" onClick={onDismiss}>
        <FormattedMessage {...translations.dismiss} />
      </Button>
    );

    return (
      <Dialog
        open
        title={title}
        actions={[...actionButtons, dismissButton]}
        contentStyle={styles.dialog}
        titleStyle={styles.centralise}
        bodyStyle={styles.centralise}
        onRequestClose={this.props.onDismiss}
      >
        {children}
      </Dialog>
    );
  }
}

Popup.propTypes = {
  title: PropTypes.string,
  onDismiss: PropTypes.func,
  children: PropTypes.node,
  actionButtons: PropTypes.arrayOf(PropTypes.node),
};

Popup.defaultProps = {
  actionButtons: [],
};

export default Popup;
