import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormAutoCompleteField from 'lib/components/form/fields/AutoCompleteField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import ErrorText from 'lib/components/ErrorText';
import { shiftDateField } from 'lib/helpers/form-helpers';
import formTranslations from 'lib/translations/form';
import translations from 'course/lesson-plan/translations';
import { fields } from 'course/lesson-plan/constants';

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

const validationTranslations = defineMessages({
  startEndValidationError: {
    id: 'course.lessonPlan.EventForm.startEndValidationError',
    defaultMessage: 'Must be after "Start At"',
  },
});

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  event_type: yup.string().nullable().required(formTranslations.required),
  location: yup.string().nullable(),
  description: yup.string().nullable(),
  start_at: yup.date().nullable().required(formTranslations.required),
  end_at: yup
    .date()
    .nullable()
    .min(yup.ref('start_at'), validationTranslations.startEndValidationError),
  published: yup.bool(),
});

const EventForm = (props) => {
  const { onSubmit, initialValues, disabled, eventTypes, eventLocations } =
    props;
  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  return (
    <>
      <form
        id="event-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
        <Controller
          name="title"
          control={control}
          render={({ field, fieldState }) => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations[TITLE]} />}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
              variant="standard"
            />
          )}
        />
        <div style={styles.columns}>
          <Controller
            name="event_type"
            control={control}
            render={({ field, fieldState }) => (
              <FormAutoCompleteField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                fullWidth
                label={<FormattedMessage {...translations[EVENT_TYPE]} />}
                options={eventTypes}
                selectOnFocus
                style={styles.eventType}
              />
            )}
          />
          <Controller
            name="location"
            control={control}
            render={({ field, fieldState }) => (
              <FormAutoCompleteField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
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
          name="description"
          control={control}
          render={({ field, fieldState }) => (
            <FormRichTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations[DESCRIPTION]} />}
              fullWidth
              multiline
              InputLabelProps={{
                shrink: true,
              }}
              rows={2}
              variant="standard"
            />
          )}
        />
        <div style={styles.columns}>
          <Controller
            name="start_at"
            control={control}
            render={({ field, fieldState }) => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations[START_AT]} />}
                afterChangeField={(newStartAt) =>
                  shiftDateField(newStartAt, watch, setValue)
                }
                style={styles.oneColumn}
              />
            )}
          />
          <Controller
            name="end_at"
            control={control}
            render={({ field, fieldState }) => (
              <FormDateTimePickerField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations[END_AT]} />}
                style={styles.oneColumn}
              />
            )}
          />
        </div>
        <Controller
          name="published"
          control={control}
          render={({ field, fieldState }) => (
            <FormToggleField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations[PUBLISHED]} />}
              style={styles.toggle}
            />
          )}
        />
      </form>
    </>
  );
};

EventForm.propTypes = {
  disabled: PropTypes.bool,
  eventTypes: PropTypes.arrayOf(PropTypes.string),
  eventLocations: PropTypes.arrayOf(PropTypes.string),
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

export default EventForm;
