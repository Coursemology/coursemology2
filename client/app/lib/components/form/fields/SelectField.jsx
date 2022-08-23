import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  InputLabel,
  FormHelperText,
  Select,
  MenuItem,
} from '@mui/material';
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
    onChangeCustom,
    margin,
    shrink,
    displayEmpty,
    className,
    variant = 'standard',
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

  return (
    <FormControl
      disabled={disabled}
      error={isError}
      fullWidth
      style={{ margin: margin ?? styles.selectFieldStyle.margin }}
      variant={variant}
    >
      <InputLabel shrink={shrink}>{label}</InputLabel>
      <Select
        id="select"
        {...field}
        onChange={(event) =>
          onChangeCustom
            ? onChangeCustom(event.target.value)
            : field.onChange(event)
        }
        {...custom}
        variant={variant}
        displayEmpty={displayEmpty}
        className={className}
        MenuProps={{
          style: { maxHeight: '50vh' },
        }}
      >
        {noneSelected && (
          <MenuItem value="" key={noneSelected}>
            {noneSelected}
          </MenuItem>
        )}
        {options &&
          options.map((option) => (
            <MenuItem
              key={option.value}
              id={`select-${option.value}`}
              value={option.value}
            >
              {option.label}
            </MenuItem>
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
  onChangeCustom: PropTypes.func,
  margin: PropTypes.string,
  shrink: PropTypes.bool,
  displayEmpty: PropTypes.bool,
  className: PropTypes.string,
  variant: PropTypes.string,
};

export default memo(FormSelectField, propsAreEqual);
