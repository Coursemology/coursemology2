import { memo } from 'react';
import PropTypes from 'prop-types';
import { Checkbox, FormControlLabel, FormHelperText } from '@mui/material';
import { formatErrorMessage } from './utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

const styles = {
  checkboxContainer: {
    width: '100%',
  },
  checkbox: {
    margin: '-4px 0px 0px 0px',
    padding: '2px',
  },
  checkboxStyle: {
    marginLeft: '0px',
  },
  errorText: { margin: 0 },
};

const FormCheckboxField = (props) => {
  const {
    field,
    fieldState,
    disabled,
    label,
    renderIf,
    icon,
    checkedIcon,
    ...custom
  } = props;
  const isError = !!fieldState.error;
  if (!renderIf) {
    return null;
  }

  return (
    <div style={styles.checkboxContainer}>
      <FormControlLabel
        control={
          <Checkbox
            {...field}
            checked={field.value}
            color="primary"
            onChange={field.onChange}
            style={styles.checkbox}
            icon={icon}
            checkedIcon={checkedIcon}
          />
        }
        disabled={disabled}
        label={<b>{label}</b>}
        labelPlacement="start"
        style={styles.checkboxStyle}
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

FormCheckboxField.defaultProps = {
  renderIf: true,
};

FormCheckboxField.propTypes = {
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  renderIf: PropTypes.bool,
  icon: PropTypes.element,
  checkedIcon: PropTypes.element,
};

export default memo(FormCheckboxField, propsAreEqual);
