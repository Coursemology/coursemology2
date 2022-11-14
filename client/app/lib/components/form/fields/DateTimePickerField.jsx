import { defineMessages, injectIntl } from 'react-intl';
import { TextField } from '@mui/material';
import {
  DateTimePicker as MuiDateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import PropTypes from 'prop-types';

import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';

const translations = defineMessages({
  invalidDateTime: {
    id: 'lib.components.form.DateTimePicker.invalidDateTime',
    defaultMessage: 'Invalid Date and/or Time',
  },
});

const styles = {
  dateTimePicker: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  dateTimeTextField: {
    marginRight: 5,
  },
  dialogStyle: {
    '.MuiDialog-paper': {
      overflowY: 'visible',
    },
  },
};

const FormDateTimePickerField = (props) => {
  const {
    afterChangeField,
    field,
    fieldState,
    disabled,
    label,
    renderIf,
    style,
    className,
    variant = 'standard',
    disableMargins,
    disableShrinkingLabel,
    ...custom
  } = props;

  if (!renderIf) {
    return null;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div style={{ ...styles.dateTimePicker, ...style }}>
        <MuiDateTimePicker
          {...field}
          ampm
          clearable
          DialogProps={{ sx: styles.dialogStyle }}
          disabled={disabled}
          inputFormat="DD-MM-YYYY HH:mm"
          label={label}
          mask="__-__-____ __:__"
          onCancel={() => null}
          {...custom}
          renderInput={(params) => (
            <TextField
              className={className}
              {...params}
              error={!!fieldState.error || params.error}
              fullWidth
              helperText={
                fieldState.error
                  ? formatErrorMessage(fieldState.error.message)
                  : params.error &&
                    formatErrorMessage(translations.invalidDateTime)
              }
              name={field.name}
              {...(!disableShrinkingLabel && {
                InputLabelProps: { shrink: true },
              })}
              ref={field.ref}
              variant={variant}
              {...(disableMargins ? null : { style: styles.dateTimeTextField })}
            />
          )}
        />
      </div>
    </LocalizationProvider>
  );
};

FormDateTimePickerField.defaultProps = {
  renderIf: true,
};

FormDateTimePickerField.propTypes = {
  afterChangeField: PropTypes.func,
  field: PropTypes.object.isRequired,
  fieldState: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.node,
  intl: PropTypes.object.isRequired,
  renderIf: PropTypes.bool,
  style: PropTypes.object,
  className: PropTypes.string,
  variant: PropTypes.string,
  disableMargins: PropTypes.bool,
  disableShrinkingLabel: PropTypes.bool,
};

export default injectIntl(FormDateTimePickerField);
