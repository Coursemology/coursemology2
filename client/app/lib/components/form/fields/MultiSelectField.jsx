import { memo } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

const styles = {
  listboxStyle: {
    maxHeight: '80vh',
    overflowY: 'auto',
  },
};

const FormMultiSelectField = (props) => {
  const { field, fieldState, disabled, label, options, renderIf, ...custom } =
    props;
  if (!renderIf) {
    return null;
  }
  const selectedOptions = field.value.map((v) =>
    options.find((o) => o.id === v),
  );

  return (
    <Autocomplete
      {...field}
      disabled={disabled}
      filterSelectedOptions
      fullWidth
      getOptionLabel={(option) => option.title}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      ListboxProps={{ style: styles.listboxStyle }}
      multiple
      options={options}
      onChange={(event, val) => {
        const selectedOptionIds = val.map((option) => option.id);
        field.onChange(selectedOptionIds);
      }}
      value={selectedOptions}
      {...custom}
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
          variant="standard"
        />
      )}
    />
  );
};

FormMultiSelectField.defaultProps = {
  renderIf: true,
};

export const optionShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
});

FormMultiSelectField.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  options: PropTypes.arrayOf(optionShape),
  renderIf: PropTypes.bool,
};

export default memo(FormMultiSelectField, propsAreEqual);
