import { memo } from 'react';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import PropTypes from 'prop-types';

import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';

import propsAreEqual from './utils/propsAreEqual';

const styles = {
  selectFieldStyle: {
    margin: '8px 10px 8px 0px',
  },
  errorText: { margin: 0 },
};

const FormSelectField = (props) => {
  const {
    field,
    fieldState,
    disabled,
    label,
    options,
    renderIf,
    noneSelected,
    sx,
    margin,
    shrink,
    displayEmpty,
    className,
    variant = 'standard',
    native,
    ...custom
  } = props;
  const isError = !!fieldState.error;
  if (!renderIf) {
    return null;
  }
  if (sx) {
    styles.selectFieldStyle = {
      ...styles.selectFieldStyle,
      ...sx,
    };
  }

  const Option = (optionProps) =>
    native ? <option {...optionProps} /> : <MenuItem {...optionProps} />;

  return (
    <FormControl
      disabled={disabled}
      error={isError}
      fullWidth
      required={props.required}
      sx={{ margin: margin ?? styles.selectFieldStyle.margin }}
      variant={variant}
    >
      <InputLabel shrink={shrink}>{label}</InputLabel>
      <Select
        id="select"
        {...field}
        native={native}
        {...custom}
        className={className}
        displayEmpty={displayEmpty}
        MenuProps={{
          style: { maxHeight: '50vh' },
        }}
        variant={variant}
      >
        {noneSelected && (
          <Option key={noneSelected} value="">
            {noneSelected}
          </Option>
        )}
        {options &&
          options.map((option) => (
            <Option
              key={option.value}
              disabled={option.disabled ?? false}
              id={`select-${option.value}`}
              value={option.value}
            >
              {option.label}
            </Option>
          ))}
      </Select>
      {isError && (
        <FormHelperText error={isError} style={styles.errorText}>
          {formatErrorMessage(fieldState.error.message)}
        </FormHelperText>
      )}
    </FormControl>
  );
};

FormSelectField.defaultProps = {
  renderIf: true,
};

FormSelectField.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  options: PropTypes.arrayOf(PropTypes.object),
  sx: PropTypes.object,
  renderIf: PropTypes.bool,
  noneSelected: PropTypes.string,
  margin: PropTypes.string,
  shrink: PropTypes.bool,
  displayEmpty: PropTypes.bool,
  className: PropTypes.string,
  variant: PropTypes.string,
  type: PropTypes.string,
  native: PropTypes.bool,
  required: PropTypes.bool,
};

export default memo(FormSelectField, propsAreEqual);
