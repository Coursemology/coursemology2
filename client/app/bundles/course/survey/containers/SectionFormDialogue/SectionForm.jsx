import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import useEmitterFactory from 'react-emitter-factory';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import ErrorText from 'lib/components/core/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';
import translations from 'course/survey/translations';

const validationSchema = yup.object({
  title: yup.string().required(formTranslations.required),
  description: yup.string(),
});

const SectionForm = (props) => {
  const { onSubmit, disabled, initialValues } = props;
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
      id="survey-section-form"
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
          <FormTextField
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
    </form>
  );
};

SectionForm.propTypes = {
  disabled: PropTypes.bool,
  initialValues: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default SectionForm;
