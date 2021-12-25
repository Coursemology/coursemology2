import { FormattedMessage } from 'react-intl';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
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
    <FlatButton
      label={<FormattedMessage {...translations.dismiss} />}
      onClick={onDismiss}
      primary={true}
    />
  );

  return (
    <Dialog
      actions={[...actionButtons, dismissButton]}
      bodyStyle={styles.centralise}
      contentStyle={styles.dialog}
      onRequestClose={props.onDismiss}
      open={true}
      title={title}
      titleStyle={styles.centralise}
    >
      {children}
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
