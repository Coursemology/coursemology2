import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button } from '@material-ui/core';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
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

const Popup = (props) => {
  const { title, children, actionButtons, onDismiss } = props;
  const dismissButton = (
    <Button color="primary" key="dismiss-button" onClick={onDismiss}>
      <FormattedMessage {...translations.dismiss} />
    </Button>
  );

  return (
    <Dialog onClose={onDismiss} open maxWidth="xl">
      <DialogTitle style={styles.centralise}>{title}</DialogTitle>
      <DialogContent style={{ ...styles.dialog, ...styles.centralise }}>
        {children}
      </DialogContent>
      <DialogActions>
        {actionButtons} {dismissButton}
      </DialogActions>
    </Dialog>
  );
};

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
