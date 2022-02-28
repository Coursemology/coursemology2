import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  InputLabel,
  FormHelperText,
  Select,
} from '@material-ui/core';
import createComponent from './createComponent';
import mapError from './mapError';

const propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  errorText: PropTypes.node,
  label: PropTypes.node,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
};

const styles = {
  selectFieldStyle: {
    // height: '30px',
    margin: '14px 10px 12px 0px',
  },
  errorText: { margin: 0 },
};

const renderSelectField = React.forwardRef((props, ref) => {
  const { children, disabled, errorText, label, onChange, value, ...custom } =
    props;
  const isError = !!errorText;
  return (
    <FormControl
      disabled={disabled}
      error={isError}
      fullWidth
      style={styles.selectFieldStyle}
    >
      <InputLabel>{label}</InputLabel>
      <Select ref={ref} onChange={onChange} value={value} {...custom}>
        {children}
      </Select>
      {isError && (
        <FormHelperText error={isError} style={styles.errorText}>
          {errorText}
        </FormHelperText>
      )}
    </FormControl>
  );
});

renderSelectField.displayName = `SelectField`;
renderSelectField.name = 'SelectField';
renderSelectField.propTypes = propTypes;

const mapProps = ({
  input: { onChange, ...inputProps },
  onChange: onChangeFromField,
  ...props
}) => ({
  ...mapError({ ...props, input: inputProps }),
  onChange: (event) => {
    onChange(event.target.value);
    if (onChangeFromField) {
      onChangeFromField(event.target.value);
    }
  },
});

export default createComponent(renderSelectField, mapProps);
