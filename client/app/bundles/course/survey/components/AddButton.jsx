import PropTypes from 'prop-types';
import Add from '@material-ui/icons/Add';
import { Fab } from '@material-ui/core';
import { white } from '@material-ui/core/colors';

const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: 40,
    right: 40,
  },
};

const propTypes = {
  onClick: PropTypes.func,
};

const AddButton = ({ onClick }) => (
  <Fab color="primary" {...{ onClick }} style={styles.floatingButton}>
    <Add nativeColor={white} />
  </Fab>
);

AddButton.propTypes = propTypes;

export default AddButton;
