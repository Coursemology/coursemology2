import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';

import NotificationBar from 'lib/components/NotificationBar';

export const notificationShape = PropTypes.shape({
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
});

/*
 * This is a wrapper for NotificationBar that accepts a react-intl message object and
 * passes the translated message to NotificationBar.
 */
class IntlNotificationBar extends React.Component {
  static propTypes = {
    // A notification object in the format of `{ message: 'xxx' }`, it has to be an object because
    // reference compare `===` is used and strings with same value will have the same reference.
    notification: notificationShape,
    intl: intlShape,
    // Other options are passed to the original implementation of the SnackBar.
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.notification !== this.props.notification;
  }

  render() {
    const { intl, notification, ...options } = this.props;
    const message = notification && notification.message;
    return (
      <NotificationBar
        notification={message ? { message: intl.formatMessage(message) } : null}
        {...options}
      />
    );
  }
}

export default injectIntl(IntlNotificationBar);
