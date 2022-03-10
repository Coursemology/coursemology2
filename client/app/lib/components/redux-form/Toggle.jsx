import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  Switch,
} from '@material-ui/core';
import createComponent from './createComponent';
import mapError from './mapError';

const propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  errorText: PropTypes.node,
  label: PropTypes.node,
  onToggle: PropTypes.func,
};

const styles = {
  toggleFieldStyle: {
    height: '30px',
    margin: '8px 0px 0px -8px',
  },
  errorText: { margin: 0 },
};

const renderToggleField = forwardRef((props, ref) => {
  const { checked, disabled, errorText, label, onToggle, ...custom } = props;
  const isError = !!errorText;
  return (
    <FormControl
      disabled={disabled}
      error={isError}
      fullWidth
      variant="standard"
    >
      <FormControlLabel
        control={
          <Switch checked={checked} color="primary" onChange={onToggle} />
        }
        label={<b>{label}</b>}
        {...custom}
        ref={ref}
        style={styles.toggleFieldStyle}
      />
      {isError && (
        <FormHelperText error={isError} style={styles.errorText}>
          {errorText}
        </FormHelperText>
      )}
    </FormControl>
  );
});

renderToggleField.displayName = `ToggleField`;
renderToggleField.name = 'ToggleField';
renderToggleField.propTypes = propTypes;

const mapProps = ({ input: { value, onChange, ...inputProps }, ...props }) => ({
  ...mapError({ ...props, input: inputProps }),
  checked: !!value,
  onToggle: onChange,
});

export default createComponent(renderToggleField, mapProps);
