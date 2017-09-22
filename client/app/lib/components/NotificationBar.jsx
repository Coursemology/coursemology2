import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Snackbar from 'material-ui/Snackbar';

export const notificationShape = PropTypes.shape({
  message: PropTypes.oneOfType([
    PropTypes.string.isRequired,
    PropTypes.object.isRequired,
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  ]),
  errors: PropTypes.string,
});

/*
 * This is a simplified SnackBar, which will send notification and auto hide the notification after
 * certain period (default is 2000ms).
 */
export default class NotificationBar extends React.Component {
  static propTypes = {
    // A notification object in the format of `{ message: 'xxx' }`, it has to be an object because
    // reference compare `===` is used and strings with same value will have the same reference.
    notification: notificationShape,
    // Other options are passed to the original implementation of the SnackBar.
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.notification !== this.props.notification;
  }

  render() {
    const { notification, ...options } = this.props;
    const message = notification && notification.message;
    const errors = notification && notification.errors;

    let notificationNode = null;
    if (message && message.id) {
      notificationNode = <FormattedMessage {...message} values={{ errors }} />;
    } else if (message) {
      notificationNode = message;
    } else {
      notificationNode = '';
    }
    return (
      <Snackbar
        open={!!message}
        message={notificationNode}
        autoHideDuration={2000}
        {...options}
      />
    );
  }
}
