import useEmitterFactory from 'react-emitter-factory';
import { Controller, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import translations from 'course/survey/translations';
import ErrorText from 'lib/components/core/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';

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
            label={<FormattedMessage {...translations.title} />}
            required
            variant="standard"
          />
        )}
      />
      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <FormTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            label={<FormattedMessage {...translations.description} />}
            multiline
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
