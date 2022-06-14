import { memo } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

const styles = {
  autoCompleteFieldStyle: {
    margin: '8px 10px 8px 0px',
  },
};

const FormAutoCompleteField = (props) => {
  const { field, fieldState, disabled, label, options, renderIf, ...custom } =
    props;
  if (!renderIf) {
    return null;
  }

  return (
    <Autocomplete
      {...field}
      disabled={disabled}
      freeSolo
      fullWidth
      onChange={(event, newValue) => field.onChange(newValue)}
      onInputChange={(event, newValue) => field.onChange(newValue)}
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={!!fieldState.error}
          helperText={
            fieldState.error && formatErrorMessage(fieldState.error.message)
          }
          InputLabelProps={{
            shrink: true,
          }}
          style={styles.autoCompleteFieldStyle}
          variant="standard"
        />
      )}
      {...custom}
    />
  );
};

FormAutoCompleteField.defaultProps = {
  renderIf: true,
};

FormAutoCompleteField.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  options: PropTypes.arrayOf(PropTypes.string),
  renderIf: PropTypes.bool,
};

export default memo(FormAutoCompleteField, propsAreEqual);
