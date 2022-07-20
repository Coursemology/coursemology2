import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { TextField } from '@mui/material';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import { FIELD_DEBOUNCE_DELAY } from 'lib/constants/sharedConstants';
import propsAreEqual from './utils/propsAreEqual';

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
    setOwnValue(e.target.value);
    syncFormState(e);
  };

  return (
    <TextField
      {...field}
      value={ownValue}
      onChange={handleChange}
      disabled={disabled}
      label={label}
      error={!!fieldState.error}
      helperText={
        fieldState.error && formatErrorMessage(fieldState.error.message)
      }
      {...custom}
      style={margins ? styles.textFieldStyle : styles.empty}
      onKeyPress={(e) => custom.type === 'number' && onlyNumberInput(e)}
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
};

export default memo(FormTextField, propsAreEqual);
