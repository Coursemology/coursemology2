import { FormattedMessage } from 'react-intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import PropTypes from 'prop-types';

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
    <Button key="dismiss-button" color="primary" onClick={onDismiss}>
      <FormattedMessage {...translations.dismiss} />
    </Button>
  );

  return (
    <Dialog maxWidth="xl" onClose={onDismiss} open={true}>
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
