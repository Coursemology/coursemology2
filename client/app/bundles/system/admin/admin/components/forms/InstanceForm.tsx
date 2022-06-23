import { FC, useEffect } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from '@mui/material';

import ErrorText from 'lib/components/ErrorText';
import formTranslations from 'lib/translations/form';
import FormTextField from 'lib/components/form/fields/TextField';
import { InstanceFormData } from 'types/system/instances';

interface Props {
  handleClose: (isDirty: boolean) => void;
  onSubmit: (data: InstanceFormData, setError: unknown) => void;
  setIsDirty?: (value: boolean) => void;
  initialValues?: Object;
}

interface IFormInputs {
  name: string;
  host: string;
}

const translations = defineMessages({
  name: {
    id: 'system.admin.instances.form.name',
    defaultMessage: 'Name',
  },
  host: {
    id: 'system.admin.instances.form.host',
    defaultMessage: 'Host',
  },
});

const validationSchema = yup.object({
  name: yup.string().required(formTranslations.required),
  host: yup.string().required(formTranslations.required),
});

const InstanceForm: FC<Props> = (props) => {
  const { handleClose, initialValues, onSubmit, setIsDirty } = props;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<IFormInputs>({
    defaultValues: initialValues,
    resolver: yupResolver<yup.AnyObjectSchema>(validationSchema),
  });

  useEffect(() => {
    if (setIsDirty) {
      if (isDirty) {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    }
  }, [isDirty]);

  const disabled = isSubmitting;

  const actionButtons = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '20px',
      }}
    >
      <Button
        color="primary"
        className="btn-cancel"
        disabled={disabled}
        key="instance-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        <FormattedMessage {...formTranslations.cancel} />
      </Button>
      <Button
        id="instance-form-submit-button"
        color="primary"
        className="btn-submit"
        disabled={disabled || !isDirty}
        form="instance-form"
        key="instance-form-submit-button"
        type="submit"
      >
        <FormattedMessage {...formTranslations.submit} />
      </Button>
    </div>
  );

  return (
    <>
      <form
        encType="multipart/form-data"
        id="instance-form"
        noValidate
        onSubmit={handleSubmit((data) => onSubmit(data, setError))}
      >
        <ErrorText errors={errors} />
        <div id="instance-name">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={disabled}
                label={<FormattedMessage {...translations.name} />}
                // @ts-ignore: component is still written in JS
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                required
                variant="standard"
              />
            )}
          />
        </div>

        <Controller
          name="host"
          control={control}
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              field={field}
              fieldState={fieldState}
              disabled={disabled}
              label={<FormattedMessage {...translations.host} />}
              // @ts-ignore: component is still written in JS
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              required
              variant="standard"
            />
          )}
        />
        <div style={{ marginBottom: 12 }} />

        {actionButtons}
      </form>
    </>
  );
};

export default InstanceForm;
