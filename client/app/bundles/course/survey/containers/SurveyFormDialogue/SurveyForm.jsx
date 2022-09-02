import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import ReactTooltip from 'react-tooltip';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import ErrorText from 'lib/components/ErrorText';
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
  base_exp: yup
    .number()
    .typeError(formTranslations.required)
    .required(formTranslations.required),
  time_bonus_exp: yup.number(),
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
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });
  const allowResponseAfterEnd = watch('allow_response_after_end');

  return (
    <form
      id="survey-form"
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
            label={<FormattedMessage {...translations.title} />}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            required
            variant="standard"
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field, fieldState }) => (
          <FormRichTextField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.description} />}
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
              label={<FormattedMessage {...translations.opensAt} />}
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
              label={<FormattedMessage {...translations.expiresAt} />}
              style={styles.oneColumn}
            />
          )}
        />
      </div>
      <div style={styles.columns}>
        <div style={styles.oneColumn}>
          <Controller
            name="base_exp"
            control={control}
            render={({ field, fieldState }) => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                fullWidth
                label={<FormattedMessage {...translations.basePoints} />}
                InputLabelProps={{
                  shrink: true,
                }}
                onWheel={(event) => event.currentTarget.blur()}
                type="number"
                variant="standard"
              />
            )}
          />
        </div>
        <div
          style={styles.oneColumn}
          data-tip
          data-for="timeBonusExpTooltip"
          data-tip-disable={allowResponseAfterEnd}
        >
          <Controller
            name="time_bonus_exp"
            control={control}
            render={({ field, fieldState }) => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={disabled || !allowResponseAfterEnd}
                fullWidth
                label={<FormattedMessage {...translations.bonusPoints} />}
                InputLabelProps={{
                  shrink: true,
                }}
                onWheel={(event) => event.currentTarget.blur()}
                style={styles.flexChild}
                type="number"
                variant="standard"
              />
            )}
          />
          <ReactTooltip id="timeBonusExpTooltip">
            <FormattedMessage {...translations.timeBonusExpTooltip} />
          </ReactTooltip>
        </div>
      </div>
      <Controller
        name="allow_response_after_end"
        control={control}
        render={({ field, fieldState }) => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations.allowResponseAfterEnd} />}
            style={styles.toggle}
          />
        )}
      />
      <div style={styles.hint}>
        {intl.formatMessage(surveyFormTranslations.allowResponseAfterEndHint)}
      </div>
      <Controller
        name="allow_modify_after_submit"
        control={control}
        render={({ field, fieldState }) => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={
              <FormattedMessage {...translations.allowModifyAfterSubmit} />
            }
            style={styles.toggle}
          />
        )}
      />
      <div style={styles.hint}>
        {intl.formatMessage(translations.allowModifyAfterSubmitHint)}
      </div>
      <Controller
        name="anonymous"
        control={control}
        render={({ field, fieldState }) => (
          <FormToggleField
            field={field}
            fieldState={fieldState}
            disabled={disabled || disableAnonymousToggle}
            label={<FormattedMessage {...translations.anonymous} />}
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
