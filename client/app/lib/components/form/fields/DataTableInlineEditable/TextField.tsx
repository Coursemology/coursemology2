import { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';

const styles = {
  textFieldStyle: { margin: '8px 10px 8px 0px', width: '100%' },
};

const InlineEditTextField = (props): JSX.Element | null => {
  const {
    updateValue,
    value,
    disabled,
    label,
    renderIf,
    className,
    ...custom
  } = props;
  const [controlledVal, setControlledVal] = useState(value);
  if (!renderIf) {
    return null;
  }

  const handleChange = (event): void => {
    setControlledVal(event.target.value);
  };

  const handleBlur = (): void => {
    updateValue(controlledVal);
  };

  return (
    <TextField
      value={controlledVal}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      label={label}
      className={className}
      {...custom}
      style={styles.textFieldStyle}
    />
  );
};

InlineEditTextField.defaultProps = {
  renderIf: true,
};

InlineEditTextField.propTypes = {
  value: PropTypes.string,
  updateValue: PropTypes.func,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  renderIf: PropTypes.bool,
  className: PropTypes.string,
  variant: PropTypes.string,
};

export default InlineEditTextField;
