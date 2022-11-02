import { memo } from 'react';
import PropTypes from 'prop-types';
import { FormControlLabel, FormHelperText, Switch } from '@mui/material';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

const styles = {
  toggleField: {
    width: '100%',
  },
  errorText: { margin: 0 },
};

const FormToggleField = (props) => {
  const { field, fieldState, disabled, label, renderIf, ...custom } = props;
  const isError = !!fieldState.error;
  if (!renderIf) {
    return null;
  }

  return (
    <div style={styles.toggleField}>
      <FormControlLabel
        control={
          <Switch
            {...field}
            checked={field.value}
            color="primary"
            onChange={field.onChange}
          />
        }
        disabled={disabled}
        label={<b>{label}</b>}
        {...custom}
      />
      {isError && (
        <FormHelperText error={isError} style={styles.errorText}>
          {formatErrorMessage(fieldState.error.message)}
        </FormHelperText>
      )}
    </div>
  );
};

FormToggleField.defaultProps = {
  renderIf: true,
};

FormToggleField.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  renderIf: PropTypes.bool,
};

export default memo(FormToggleField, propsAreEqual);
