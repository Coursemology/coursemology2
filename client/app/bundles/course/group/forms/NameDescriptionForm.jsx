import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import useEmitterFactory from 'react-emitter-factory';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import ErrorText from 'lib/components/core/ErrorText';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';
import { formNames } from '../constants';

const translations = defineMessages({
  name: {
    id: 'course.group.nameDescriptionForm.name',
    defaultMessage: 'Name',
  },
  description: {
    id: 'course.group.nameDescriptionForm.description',
    defaultMessage: 'Description (Optional)',
  },
  nameLength: {
    id: 'course.group.nameDescriptionForm.nameLength',
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
  const { initialValues, onSubmit } = props;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
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
      id={formNames.GROUP}
      noValidate
      onSubmit={handleSubmit((data) => onSubmit(data, setError))}
    >
      <ErrorText errors={errors} />
      <div style={styles.flexCol}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={isSubmitting}
              label={<FormattedMessage {...translations.name} />}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
              style={styles.flexChild}
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
              disabled={isSubmitting}
              label={<FormattedMessage {...translations.description} />}
              fullWidth
              multiline
              InputLabelProps={{
                shrink: true,
              }}
              minRows={2}
              maxRows={4}
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
};

export default NameDescriptionForm;
