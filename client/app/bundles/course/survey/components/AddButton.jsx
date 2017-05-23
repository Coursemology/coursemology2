import React from 'react';
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
  onTouchTap: PropTypes.func,
};

const AddButton = ({ onTouchTap }) => (
  <FloatingActionButton style={styles.floatingButton} {...{ onTouchTap }}>
    <ContentAdd />
  </FloatingActionButton>
);

AddButton.propTypes = propTypes;

export default AddButton;
