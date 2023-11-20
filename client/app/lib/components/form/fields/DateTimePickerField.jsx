import { defineMessages, injectIntl } from 'react-intl';
import {
  DateTimePicker as MuiDateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import PropTypes from 'prop-types';

import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import moment from 'lib/moment';

const translations = defineMessages({
  invalidDateTime: {
    id: 'lib.components.form.fields.DateTimePickerField.invalidDateTime',
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
};

const FormDateTimePickerField = (props) => {
  const {
    afterChangeField,
    field,
    fieldState,
    disabled,
    label,
    renderIf,
    required,
    style,
    className,
    variant = 'standard',
    disableMargins,
    disableShrinkingLabel,
    suppressesFormatErrors,
    ...custom
  } = props;

  if (!renderIf) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <div style={{ ...styles.dateTimePicker, ...style }}>
        <MuiDateTimePicker
          {...field}
          ampm={false}
          disabled={disabled}
          format="DD-MM-YYYY HH:mm"
          label={label}
          onCancel={() => null}
          value={moment(field.value).startOf('minute')}
          {...custom}
          slotProps={{
            textField: {
              className,
              required,
              variant,
              fullWidth: true,
              name: field.name,
              ref: field.ref,
              ...(!suppressesFormatErrors && {
                error: Boolean(fieldState.error),
                helperText:
                  fieldState.error &&
                  formatErrorMessage(
                    fieldState.error.message || translations.invalidDateTime,
                  ),
              }),
              ...(!disableShrinkingLabel && {
                InputLabelProps: { shrink: true },
              }),
              ...(!disableMargins && {
                style: styles.dateTimeTextField,
              }),
            },
          }}
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
  required: PropTypes.bool,
  suppressesFormatErrors: PropTypes.bool,
};

export default injectIntl(FormDateTimePickerField);
