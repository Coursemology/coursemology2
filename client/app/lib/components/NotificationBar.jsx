import { useState, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Snackbar } from '@mui/material';

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
 * certain period (default is 5000).
 */
const NotificationBar = (props) => {
  const { notification, autoHideDuration = 5000, ...options } = props;
  const message = notification && notification.message;
  const errors = notification && notification.errors;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.notification) {
      setOpen(!!props.notification.message);
    }
  }, [props.notification]);

  const handleClose = () => {
    setOpen(false);
  };

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
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      style={{
        height: 'auto',
        maxWidth: '100%',
        whiteSpace: 'pre-line',
      }}
      open={open}
      onClose={handleClose}
      message={notificationNode}
      autoHideDuration={autoHideDuration}
      {...options}
    />
  );
};

NotificationBar.propTypes = {
  // A notification object in the format of `{ message: 'xxx' }`, it has to be an object because
  // reference compare `===` is used and strings with same value will have the same reference.
  notification: notificationShape,
  // Other options are passed to the original implementation of the SnackBar.
  autoHideDuration: PropTypes.number,
};

export default memo(
  NotificationBar,
  (prevProps, nextProps) => prevProps.notification === nextProps.notification,
);
