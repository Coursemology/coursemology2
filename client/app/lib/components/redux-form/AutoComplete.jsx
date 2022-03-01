import React from 'react';
import PropTypes from 'prop-types';
import { FormControl, FormHelperText, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import createComponent from './createComponent';
import mapError from './mapError';

const propTypes = {
  options: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
  errorText: PropTypes.node,
  label: PropTypes.node,
  onChange: PropTypes.func,
  onInputChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
  ]),
};

const styles = {
  autoCompleteFieldStyle: {
    margin: '14px 10px 12px 0px',
  },
  errorText: { margin: 0 },
};

const renderAutoCompleteField = React.forwardRef((props, ref) => {
  const {
    options,
    disabled,
    errorText,
    label,
    onChange,
    onInputChange,
    value,
    ...custom
  } = props;
  const isError = !!errorText;
  return (
    <FormControl
      disabled={disabled}
      error={isError}
      fullWidth
      style={styles.autoCompleteFieldStyle}
    >
      <Autocomplete
        freeSolo
        onChange={onChange}
        onInputChange={onInputChange}
        options={options}
        ref={ref}
        renderInput={(params) => (
          <TextField
            InputLabelProps={{
              shrink: true,
            }}
            label={label}
            {...params}
          />
        )}
        value={value}
        {...custom}
      />
      {isError && (
        <FormHelperText error={isError} style={styles.errorText}>
          {errorText}
        </FormHelperText>
      )}
    </FormControl>
  );
});

renderAutoCompleteField.displayName = `AutoCompleteField`;
renderAutoCompleteField.name = 'AutoCompleteField';
renderAutoCompleteField.propTypes = propTypes;

const mapProps = (props) => ({
  ...mapError(props),
  value: props.input.value,
  onChange: (event, newValue) => {
    props.input.onChange(newValue);
  },
  onInputChange: (event, newValue) => {
    props.input.onChange(newValue);
  },
});

export default createComponent(renderAutoCompleteField, mapProps);
