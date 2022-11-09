import useEmitterFactory from 'react-emitter-factory';
import { Controller, useForm } from 'react-hook-form';
import { injectIntl } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import FormToggleField from 'lib/components/form/fields/ToggleField';
import formTranslations from 'lib/translations/form';

import translations from '../../translations';

const styles = {
  columns: {
    display: 'flex',
  },
  oneColumn: {
    flex: 1,
  },
  toggle: {
    marginTop: 16,
  },
  hint: {
    fontSize: 14,
    marginBottom: 12,
  },
};

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string(),
  start_at: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .required(formTranslations.required),
  end_at: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .min(yup.ref('start_at'), translations.startEndValidationError)
    .when('allow_response_after_end', {
      is: true,
      then: yup
        .date()
        .min(yup.ref('start_at'), translations.startEndValidationError)
        .typeError(formTranslations.invalidDate)
        .required(formTranslations.required),
    }),
  bonus_end_at: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .min(yup.ref('start_at'), translations.bonusEndValidationError)
    .max(yup.ref('end_at'), translations.bonusEndValidationError),
  base_exp: yup
    .number()
    .typeError(formTranslations.required)
    .required(formTranslations.required),
  time_bonus_exp: yup
    .number()
    .nullable(true)
    .transform((_, val) => (val === Number(val) ? val : null)),
  allow_response_after_end: yup.bool(),
  allow_modify_after_submit: yup.bool(),
  anonymous: yup.bool(),
});

const SurveyForm = (props) => {
  const { intl, onSubmit, disabled, disableAnonymousToggle, initialValues } =
    props;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  useEmitterFactory(
    props,
    {
      isDirty,
    },
    [isDirty],
  );

  return (
    <form
      id="survey-form"
      noValidate={true}
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
            fullWidth={true}
            InputLabelProps={{
              shrink: true,
            }}
            label={intl.formatMessage(translations.title)}
            required={true}
            variant="standard"
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormRichTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth={true}
            InputLabelProps={{
              shrink: true,
            }}
            label={intl.formatMessage(translations.description)}
            multiline={true}
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
              label={intl.formatMessage(translations.opensAt)}
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
              label={intl.formatMessage(translations.expiresAt)}
              style={styles.oneColumn}
            />
          )}
        />
        <Controller
          control={control}
          name="bonus_end_at"
          render={({ field, fieldState }) => (
            <FormDateTimePickerField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(translations.bonusEndsAt)}
              style={styles.oneColumn}
            />
          )}
        />
      </div>
      <div style={styles.columns}>
        <Controller
          control={control}
          name="base_exp"
          render={({ field, fieldState }) => (
            <FormTextField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              fullWidth={true}
              InputLabelProps={{
                shrink: true,
              }}
              label={intl.formatMessage(translations.basePoints)}
              onWheel={(event) => event.currentTarget.blur()}
              style={styles.flexChild}
              type="number"
              variant="standard"
            />
          )}
        />
        <Controller
          control={control}
          name="time_bonus_exp"
          render={({ field, fieldState }) => (
            <FormTextField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              fullWidth={true}
              InputLabelProps={{
                shrink: true,
              }}
              label={intl.formatMessage(translations.bonusPoints)}
              onWheel={(event) => event.currentTarget.blur()}
              style={styles.flexChild}
              type="number"
              variant="standard"
            />
          )}
        />
      </div>
      <Controller
        control={control}
        name="allow_response_after_end"
        render={({ field, fieldState }) => (
          <FormToggleField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={intl.formatMessage(translations.allowResponseAfterEnd)}
            style={styles.toggle}
          />
        )}
      />
      <Controller
        control={control}
        name="allow_modify_after_submit"
        render={({ field, fieldState }) => (
          <FormToggleField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={intl.formatMessage(translations.allowModifyAfterSubmit)}
            style={styles.toggle}
          />
        )}
      />
      <div style={styles.hint}>
        {intl.formatMessage(translations.allowModifyAfterSubmitHint)}
      </div>
      <Controller
        control={control}
        name="anonymous"
        render={({ field, fieldState }) => (
          <FormToggleField
            disabled={disabled || disableAnonymousToggle}
            field={field}
            fieldState={fieldState}
            label={intl.formatMessage(translations.anonymous)}
            style={styles.toggle}
          />
        )}
      />
      <div style={styles.hint}>
        {disableAnonymousToggle
          ? intl.formatMessage(translations.hasStudentResponse)
          : intl.formatMessage(translations.anonymousHint)}
      </div>
    </form>
  );
};

SurveyForm.propTypes = {
  disabled: PropTypes.bool,
  disableAnonymousToggle: PropTypes.bool,
  initialValues: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default injectIntl(SurveyForm);
