import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormTextField from 'lib/components/form/fields/TextField';
import ErrorText from 'lib/components/ErrorText';
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
    <>
      <form
        id="new-course-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
        <Controller
          name="new_title"
          control={control}
          render={({ field, fieldState }) => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.newTitle} />}
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
          name="new_start_at"
          control={control}
          render={({ field, fieldState }) => (
            <FormDateTimePickerField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.newStartAt} />}
            />
          )}
        />
      </form>
    </>
  );
};

NewCourseForm.propTypes = {
  disabled: PropTypes.bool.isRequired,
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

export default NewCourseForm;
