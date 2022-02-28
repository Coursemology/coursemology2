import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@material-ui/core';
import createComponent from './createComponent';
import mapError from './mapError';

const propTypes = {
  disabled: PropTypes.bool,
  errorText: PropTypes.node,
  input: PropTypes.node,
  label: PropTypes.node,
  placeholder: PropTypes.string,
};

const styles = {
  textFieldStyle: { margin: '14px 10px 12px 0px' },
};

const renderTextField = forwardRef((props, ref) => {
  const { disabled, errorText, input, label, placeholder, ...custom } = props;
  return (
    <TextField
      disabled={disabled}
      label={label}
      placeholder={placeholder}
      InputLabelProps={{
        shrink: true,
      }}
      fullWidth
      error={!!errorText}
      helperText={errorText}
      {...input}
      {...custom}
      ref={ref}
      style={styles.textFieldStyle}
    />
  );
});

renderTextField.displayName = `TextField`;
renderTextField.name = 'TextField';
renderTextField.propTypes = propTypes;

const mapProps = (props) => ({ ...mapError(props) });

export default createComponent(renderTextField, mapProps);
