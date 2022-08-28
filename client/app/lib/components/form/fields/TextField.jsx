import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { TextField } from '@mui/material';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import { FIELD_DEBOUNCE_DELAY } from 'lib/constants/sharedConstants';

const styles = {
  textFieldStyle: { margin: '8px 10px 8px 0px' },
  empty: { margin: '0px 0px 0px 0px' },
};

const onlyNumberInput = (evt) => {
  if (evt.which === 8) {
    return;
  }
  if (evt.which < 48 || evt.which > 57) {
    evt.preventDefault();
  }
};

const FormTextField = (props) => {
  const {
    field,
    fieldState,
    disabled,
    label,
    renderIf,
    margins = true,
    enableDebouncing = false,
    ...custom
  } = props;
  const [ownValue, setOwnValue] = useState(field.value);
  if (!renderIf) {
    return null;
  }

  // Debounced function to sync the value of this component with the form. This helps to reduce the cost of re-rendering
  // the entire form when the form state changes, especially in large forms.
  const syncFormState = useCallback(
    debounce(
      (e) => {
        field.onChange(e);
      },
      enableDebouncing ? FIELD_DEBOUNCE_DELAY : 0,
    ),
    [],
  );

  // Custom onChange handler to keep track of this component's value internally
  const handleChange = (e) => {
    e.persist();
    // To remove leading whitespace
    setOwnValue(e.target.value.trimStart());
    syncFormState(e);
  };

  const handleBlur = (e) => {
    // To remove trailing whitespace when blurring from the field
    setOwnValue(e.target.value.trim()); // Update internal field value
    field.onChange(e.target.value.trim()); // Update form field value
    // Default react hook form controller onBlur function
    field.onBlur(e);
  };

  const handleKeyPress = (e) => {
    if (custom.type === 'number') {
      onlyNumberInput(e);
    }
    // To remove trailing whitespace when clicking enter within the field.
    if (e.charCode === 13) {
      setOwnValue(e.target.value.trim()); // Update internal field value
      field.onChange(e.target.value.trim()); // Update form field value
    }
  };

  return (
    <TextField
      {...field}
      value={ownValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      disabled={disabled}
      label={label}
      error={!!fieldState.error}
      helperText={
        fieldState.error && formatErrorMessage(fieldState.error.message)
      }
      {...custom}
      style={margins ? styles.textFieldStyle : styles.empty}
    />
  );
};

FormTextField.defaultProps = {
  renderIf: true,
};

FormTextField.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  renderIf: PropTypes.bool,
  margins: PropTypes.bool,
  enableDebouncing: PropTypes.bool,
  fullWidth: PropTypes.bool,
  InputLabelProps: PropTypes.object,
  onWheel: PropTypes.func,
  type: PropTypes.string,
  variant: PropTypes.string,
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  id: PropTypes.string,
  sx: PropTypes.object,
  className: PropTypes.string,
};

export default FormTextField;
