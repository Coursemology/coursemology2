import { useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import TextField from 'lib/components/core/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import { FIELD_DEBOUNCE_DELAY } from 'lib/constants/sharedConstants';

const styles = {
  textFieldStyle: { margin: '8px 10px 8px 0px' },
};

const onlyNumberInput = (e) => {
  if (e.which === 8) return;
  if (e.which < 48 || e.which > 57) e.preventDefault();
};

const FormTextField = (props) => {
  const {
    field,
    fieldState,
    disabled,
    label,
    renderIf,
    multiline = false,
    rows,
    margins = true,
    enableDebouncing = false,
    helperText,
    ...custom
  } = props;

  if (!renderIf) return null;

  const [ownValue, setOwnValue] = useState(field.value);

  useEffect(() => {
    setOwnValue(field.value);
  }, [field.value]);

  // Debounced function to sync the value of this component with the form. This helps to reduce the cost of re-rendering
  // the entire form when the form state changes, especially in large forms.
  const syncFormState = useCallback(
    debounce(field.onChange, enableDebouncing ? FIELD_DEBOUNCE_DELAY : 0),
    [],
  );

  const processValue = (e, trimStart = false) => {
    let value = trimStart ? e.target.value.trimStart() : e.target.value.trim();

    if (custom.type === 'number') value = parseInt(value, 10) || 0;
    return value;
  };

  // Custom onChange handler to keep track of this component's value internally
  const handleChange = (e) => {
    e.persist();
    // To remove leading whitespace
    setOwnValue(processValue(e, true));
    syncFormState(processValue(e, true));
  };

  const handleBlur = (e) => {
    // To remove trailing whitespace when blurring from the field
    setOwnValue(processValue(e)); // Update internal field value
    field.onChange(processValue(e)); // Update form field value
    // Default react hook form controller onBlur function
    field.onBlur(e);
  };

  const handleKeyPress = (e) => {
    if (custom.type === 'number') onlyNumberInput(e);

    // To remove trailing whitespace when clicking enter within the field.
    if (e.charCode === 13) {
      setOwnValue(processValue(e)); // Update internal field value
      field.onChange(processValue(e)); // Update form field value
    }
  };

  return (
    <TextField
      {...field}
      value={ownValue ?? ''}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      disabled={disabled}
      label={label}
      error={!!fieldState.error || !!helperText}
      multiline={multiline}
      {...(rows || null)}
      helperText={
        (fieldState.error && formatErrorMessage(fieldState.error.message)) ??
        helperText
      }
      {...(margins ? { style: styles.textFieldStyle } : null)}
      {...custom}
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
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  helperText: PropTypes.string,
};

export default FormTextField;
