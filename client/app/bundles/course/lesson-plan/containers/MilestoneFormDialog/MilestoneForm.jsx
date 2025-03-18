import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import * as yup from 'yup';

import ErrorText from 'lib/components/core/ErrorText';
import FormDateTimePickerField from 'lib/components/form/fields/DateTimePickerField';
import FormRichTextField from 'lib/components/form/fields/RichTextField';
import FormTextField from 'lib/components/form/fields/TextField';
import formTranslations from 'lib/translations/form';

import { fields } from '../../constants';
import translations from '../../translations';

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
  const { onSubmit, initialValues, disabled, onDirtyChange } = props;

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
      id="milestone-form"
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
            label={<FormattedMessage {...translations[TITLE]} />}
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
            label={<FormattedMessage {...translations[DESCRIPTION]} />}
            multiline
            rows={2}
            variant="standard"
          />
        )}
      />
      <Controller
        control={control}
        name="start_at"
        render={({ field, fieldState }) => (
          <FormDateTimePickerField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
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
  onDirtyChange: PropTypes.func,
};

export default MilestoneForm;
