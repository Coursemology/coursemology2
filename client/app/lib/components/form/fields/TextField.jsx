import { memo } from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@mui/material';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import propsAreEqual from './utils/propsAreEqual';

const styles = {
  textFieldStyle: { margin: '8px 10px 8px 0px' },
  empty: { margin: '0px 0px 0px 0px' },
};

const FormTextField = (props) => {
  const {
    field,
    fieldState,
    disabled,
    label,
    renderIf,
    onChangeCustom,
    margins,
    className,
    ...custom
  } = props;
  if (!renderIf) {
    return null;
  }

  return (
    <TextField
      className={className}
      {...field}
      disabled={disabled}
      label={label}
      error={!!fieldState.error}
      onChange={(event) =>
        onChangeCustom
          ? onChangeCustom(event.target.value)
          : field.onChange(event)
      }
      helperText={
        fieldState.error && formatErrorMessage(fieldState.error.message)
      }
      {...custom}
      style={margins ? styles.textFieldStyle : styles.empty}
      // disable 'e' value typed in number field
      onKeyDown={(e) =>
        custom.type === 'number' && Number.isNaN(+e.key) && e.preventDefault()
      }
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
  onChangeCustom: PropTypes.func,
  margins: PropTypes.bool,
  className: PropTypes.string,
};

export default memo(FormTextField, propsAreEqual);
