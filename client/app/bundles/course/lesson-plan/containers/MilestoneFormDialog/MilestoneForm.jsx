import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import translations from 'course/lesson-plan/translations';
import { fields } from 'course/lesson-plan/constants';

const { TITLE, DESCRIPTION, START_AT } = fields;

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string().nullable(),
  start_at: yup
    .date()
    .nullable()
    .typeError(formTranslations.invalidDate)
    .required(formTranslations.required),
});

const MilestoneForm = (props) => {
  const { onSubmit, initialValues, disabled } = props;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  return (
    <form
      id="milestone-form"
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
      <Controller
        name="start_at"
        control={control}
        render={({ field, fieldState }) => (
          <FormDateTimePickerField
            field={field}
            fieldState={fieldState}
            disabled={disabled}
            label={<FormattedMessage {...translations[START_AT]} />}
          />
        )}
      />
    </form>
  );
};

MilestoneForm.propTypes = {
  disabled: PropTypes.bool,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

export default MilestoneForm;
