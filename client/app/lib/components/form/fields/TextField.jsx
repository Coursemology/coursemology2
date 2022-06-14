import { memo } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

const styles = {
  textFieldStyle: { margin: '8px 10px 8px 0px' },
};

const FormTextField = (props) => {
  const { field, fieldState, disabled, label, renderIf, ...custom } = props;
  if (!renderIf) {
    return null;
  }

  return (
    <TextField
      {...field}
      disabled={disabled}
      label={label}
      error={!!fieldState.error}
      helperText={
        fieldState.error && formatErrorMessage(fieldState.error.message)
      }
      {...custom}
      style={styles.textFieldStyle}
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
};

export default memo(FormTextField, propsAreEqual);
