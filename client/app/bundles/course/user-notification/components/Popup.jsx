import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
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
  static propTypes = {
    title: PropTypes.string,
    onDismiss: PropTypes.func,
    children: PropTypes.node,
  }

  render() {
    const { title, children } = this.props;
    const actions = [
      <FlatButton
        primary
        label={<FormattedMessage {...translations.dismiss} />}
        onClick={this.props.onDismiss}
      />,
    ];

    return (
      <Dialog
        open
        title={title}
        actions={actions}
        contentStyle={styles.dialog}
        titleStyle={styles.centralise}
        bodyStyle={styles.centralise}
        onRequestClose={this.props.onDismiss}
      >
        { children }
      </Dialog>
    );
  }
}

export default Popup;
