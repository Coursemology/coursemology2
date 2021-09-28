import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';

const styles = {
  tabSize: 15,
  row: {
    display: 'flex',
  },
  label: {
    width: 'auto',
  },
};

const IndentedCheckbox = ({ indentLevel, children, ...props }) => {
  const checkboxStyle = { marginLeft: indentLevel * styles.tabSize };
  if (children) {
    checkboxStyle.width = 'auto';
  }

  return (
    <div style={styles.row}>
      <Checkbox labelStyle={styles.label} style={checkboxStyle} {...props} />
      {children}
    </div>
  );
};

IndentedCheckbox.propTypes = {
  indentLevel: PropTypes.number,
  children: PropTypes.node,
};

IndentedCheckbox.defaultProps = {
  indentLevel: 0,
};

export default IndentedCheckbox;
