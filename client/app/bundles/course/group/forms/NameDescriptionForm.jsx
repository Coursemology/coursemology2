import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';

import { formNames } from '../constants';

const translations = defineMessages({
  name: {
    id: 'course.group.NameDescriptionForm.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.group.NameDescriptionForm.description',
    defaultMessage: 'Description (Optional)',
  },
  nameLength: {
    id: 'course.group.NameDescriptionForm.nameLength',
    defaultMessage: 'The name is too long!',
  },
});

const styles = {
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  flexChild: {
    width: '100%',
  },
};
const validationSchema = yup.object({
  name: yup
    .string()
    .required(formTranslations.required)
    .max(255, formTranslations.nameLength),
  description: yup.string().nullable(),
});

const NameDescriptionForm = (props) => {
  const { initialValues, onSubmit, onDirtyChange } = props;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty]);

  return (
    <form
      id={formNames.GROUP}
      noValidate
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
    >
      <ErrorText errors={errors} />
      <div style={styles.flexCol}>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <FormTextField
              disabled={isSubmitting}
              field={field}
              fieldState={fieldState}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              label={<FormattedMessage {...translations.name} />}
              required
              style={styles.flexChild}
              variant="standard"
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <FormTextField
              disabled={isSubmitting}
              field={field}
              fieldState={fieldState}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              label={<FormattedMessage {...translations.description} />}
              maxRows={4}
              minRows={2}
              multiline
              style={styles.flexChild}
              variant="standard"
            />
          )}
        />
      </div>
    </form>
  );
};

NameDescriptionForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onDirtyChange: PropTypes.func,
};

export default NameDescriptionForm;
