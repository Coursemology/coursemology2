import { Controller, useForm } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';

const translations = defineMessages({
  newTitle: {
    id: 'course.duplication.NewCourseForm.newTitle',
    defaultMessage: 'New Title',
  },
  newStartAt: {
    id: 'course.duplication.NewCourseForm.newStartAt',
    defaultMessage: 'New Start Date *',
  },
});

const validationSchema = yup.object({
  new_title: yup.string().required(formTranslations.required),
  new_start_at: yup.string().nullable().required(formTranslations.required),
});

const NewCourseForm = (props) => {
  const { onSubmit, initialValues, disabled } = props;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'all',
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  return (
    <form
      id="new-course-form"
      noValidate={true}
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
    >
      <ErrorText errors={errors} />
      <Controller
        control={control}
        name="new_title"
        render={({ field, fieldState }) => (
          <FormTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth={true}
            InputLabelProps={{
              shrink: true,
            }}
            label={<FormattedMessage {...translations.newTitle} />}
            required={true}
            variant="standard"
          />
        )}
      />
      <Controller
        control={control}
        name="new_start_at"
        render={({ field, fieldState }) => (
          <FormDateTimePickerField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            label={<FormattedMessage {...translations.newStartAt} />}
          />
        )}
      />
    </form>
  );
};

NewCourseForm.propTypes = {
  disabled: PropTypes.bool.isRequired,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

export default NewCourseForm;
