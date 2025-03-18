import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import FormAutoCompleteField from 'lib/components/form/fields/AutoCompleteField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import formTranslations from 'lib/translations/form';

import { fields } from '../../constants';
import translations from '../../translations';

const {
  TITLE,
  EVENT_TYPE,
  LOCATION,
  DESCRIPTION,
  START_AT,
  END_AT,
  PUBLISHED,
} = fields;

const styles = {
  columns: {
    display: 'flex',
  },
  oneColumn: {
    flex: 1,
  },
  eventType: {
    flex: 1,
    marginRight: 10,
  },
  toggle: {
    marginTop: 16,
  },
};

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  event_type: yup.string().nullable().required(formTranslations.required),
  location: yup.string().nullable(),
  description: yup.string().nullable(),
  start_at: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .required(formTranslations.required),
  end_at: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .min(yup.ref('start_at'), formTranslations.startEndDateValidationError),
  published: yup.bool(),
});

const EventForm = (props) => {
  const {
    onSubmit,
    initialValues,
    disabled,
    eventTypes,
    eventLocations,
    onDirtyChange,
  } = props;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty]);

  return (
    <form
      id="event-form"
      noValidate
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
    >
      <ErrorText errors={errors} />
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <FormTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            label={<FormattedMessage {...translations[TITLE]} />}
            required
            variant="standard"
          />
        )}
      />
      <div style={styles.columns}>
        <Controller
          control={control}
          name="event_type"
          render={({ field, fieldState }) => (
            <FormAutoCompleteField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              fullWidth
              label={<FormattedMessage {...translations[EVENT_TYPE]} />}
              options={eventTypes}
              selectOnFocus
              style={styles.eventType}
            />
          )}
        />
        <Controller
          control={control}
          name="location"
          render={({ field, fieldState }) => (
            <FormAutoCompleteField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              fullWidth
              label={<FormattedMessage {...translations[LOCATION]} />}
              options={eventLocations}
              selectOnFocus
              style={styles.eventType}
            />
          )}
        />
      </div>
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormRichTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            label={<FormattedMessage {...translations[DESCRIPTION]} />}
            multiline
            rows={2}
            variant="standard"
          />
        )}
      />
      <div style={styles.columns}>
        <Controller
          control={control}
          name="start_at"
          render={({ field, fieldState }) => (
            <FormDateTimePickerField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              label={<FormattedMessage {...translations[START_AT]} />}
              style={styles.oneColumn}
            />
          )}
        />
        <Controller
          control={control}
          name="end_at"
          render={({ field, fieldState }) => (
            <FormDateTimePickerField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              label={<FormattedMessage {...translations[END_AT]} />}
              style={styles.oneColumn}
            />
          )}
        />
      </div>
      <Controller
        control={control}
        name="published"
        render={({ field, fieldState }) => (
          <FormToggleField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={<FormattedMessage {...translations[PUBLISHED]} />}
            style={styles.toggle}
          />
        )}
      />
    </form>
  );
};

EventForm.propTypes = {
  disabled: PropTypes.bool,
  eventTypes: PropTypes.arrayOf(PropTypes.string),
  eventLocations: PropTypes.arrayOf(PropTypes.string),
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onDirtyChange: PropTypes.func,
};

export default EventForm;
