import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete, TextField } from '@mui/material';
import createComponent from './createComponent';

export const optionShape = PropTypes.shape({
  id: PropTypes.number,
  title: PropTypes.string,
});

const propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  value: PropTypes.arrayOf(PropTypes.number),
  options: PropTypes.arrayOf(optionShape),
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

const styles = {
  listboxStyle: {
    maxHeight: '80vh',
    overflowY: 'auto',
  },
};

const renderMultiSelectField = forwardRef((props, ref) => {
  const { label, value, options, error, disabled, onChange } = props;
  const seletedOptions = value.map((v) => options.find((o) => o.id === v));

  return (
    <Autocomplete
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
        onChange(selectedOptionIds);
      }}
      ref={ref}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="standard"
          error={!!error}
          helperText={error}
          InputLabelProps={{
            shrink: true,
          }}
          label={label}
        />
      )}
      value={seletedOptions}
    />
  );
});

renderMultiSelectField.displayName = `MultiSelectField`;
renderMultiSelectField.name = 'MultiSelectField';
renderMultiSelectField.propTypes = propTypes;

const mapProps = ({ input, ...props }) => ({
  value: input.value,
  onChange: input.onChange,
  ...props,
});

export default createComponent(renderMultiSelectField, mapProps);
