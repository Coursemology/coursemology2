import PropTypes from 'prop-types';
import { Checkbox, FormControlLabel } from '@material-ui/core';

const styles = {
  tabSize: 15,
  row: {
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    width: 'auto',
    margin: '5px 0',
  },
};

const IndentedCheckbox = ({ indentLevel, children, label, ...props }) => {
  const checkboxStyle = {
    marginLeft: indentLevel * styles.tabSize,
    padding: '0 12px',
  };
  if (children) {
    checkboxStyle.width = 'auto';
  }

  return (
    <div style={styles.row}>
      <FormControlLabel
        control={<Checkbox color="primary" style={checkboxStyle} {...props} />}
        label={<b>{label}</b>}
        style={styles.label}
      />
      {children}
    </div>
  );
};

IndentedCheckbox.propTypes = {
  indentLevel: PropTypes.number,
  children: PropTypes.node,
  label: PropTypes.node,
};

IndentedCheckbox.defaultProps = {
  indentLevel: 0,
};

export default IndentedCheckbox;
