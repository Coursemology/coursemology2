import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { injectIntl } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';

import translations from '../../translations';

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
  has_todo: yup.bool(),
  anonymous: yup.bool(),
});

const SurveyForm = (props) => {
  const {
    intl,
    onSubmit,
    disabled,
    disableAnonymousToggle,
    initialValues,
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
      className="space-y-5"
      id="survey-form"
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
            label={intl.formatMessage(translations.title)}
            required
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
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            label={intl.formatMessage(translations.description)}
            multiline
            rows={2}
            variant="standard"
          />
        )}
      />

      <div className="flex space-x-4">
        <Controller
          control={control}
          name="start_at"
          render={({ field, fieldState }) => (
            <FormDateTimePickerField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              label={intl.formatMessage(translations.startsAt)}
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
              label={intl.formatMessage(translations.endsAt)}
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
            />
          )}
        />
      </div>

      <div className="flex space-x-4">
        <Controller
          control={control}
          name="base_exp"
          render={({ field, fieldState }) => (
            <FormTextField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              label={intl.formatMessage(translations.basePoints)}
              onWheel={(event) => event.currentTarget.blur()}
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
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              label={intl.formatMessage(translations.bonusPoints)}
              onWheel={(event) => event.currentTarget.blur()}
              type="number"
              variant="standard"
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="has_todo"
        render={({ field, fieldState }) => (
          <FormCheckboxField
            description={intl.formatMessage(translations.hasTodoHint)}
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={intl.formatMessage(translations.hasTodo)}
          />
        )}
      />

      <Controller
        control={control}
        name="allow_response_after_end"
        render={({ field, fieldState }) => (
          <FormCheckboxField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={intl.formatMessage(translations.allowResponseAfterEnd)}
          />
        )}
      />

      <Controller
        control={control}
        name="allow_modify_after_submit"
        render={({ field, fieldState }) => (
          <FormCheckboxField
            description={intl.formatMessage(
              translations.allowModifyAfterSubmitHint,
            )}
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={intl.formatMessage(translations.allowModifyAfterSubmit)}
          />
        )}
      />

      <Controller
        control={control}
        name="anonymous"
        render={({ field, fieldState }) => (
          <FormCheckboxField
            description={
              disableAnonymousToggle
                ? intl.formatMessage(translations.hasStudentResponse)
                : intl.formatMessage(translations.anonymousHint)
            }
            disabled={disabled || disableAnonymousToggle}
            field={field}
            fieldState={fieldState}
            label={intl.formatMessage(translations.anonymous)}
          />
        )}
      />
    </form>
  );
};

SurveyForm.propTypes = {
  disabled: PropTypes.bool,
  disableAnonymousToggle: PropTypes.bool,
  initialValues: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onDirtyChange: PropTypes.func,
};

export default injectIntl(SurveyForm);
