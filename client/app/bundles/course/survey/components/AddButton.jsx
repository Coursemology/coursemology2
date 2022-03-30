import PropTypes from 'prop-types';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

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
  <FloatingActionButton style={styles.floatingButton} {...{ onClick }}>
    <ContentAdd />
  </FloatingActionButton>
);

AddButton.propTypes = propTypes;

export default AddButton;
