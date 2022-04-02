import React from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';
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
  return (
    <Autocomplete
      disabled={disabled}
      freeSolo
      fullWidth
      onChange={onChange}
      onInputChange={onInputChange}
      options={options}
      ref={ref}
      renderInput={(params) => (
        <TextField
          {...params}
          error={!!errorText}
          helperText={errorText}
          InputLabelProps={{
            shrink: true,
          }}
          label={label}
          style={styles.autoCompleteFieldStyle}
          variant="standard"
        />
      )}
      value={value}
      {...custom}
    />
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
