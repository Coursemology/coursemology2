import { FC, useEffect } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from '@mui/material';

import ErrorText from 'lib/components/core/ErrorText';
import formTranslations from 'lib/translations/form';
import FormTextField from 'lib/components/form/fields/TextField';
import { InstanceFormData } from 'types/system/instances';

interface Props extends WrappedComponentProps {
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
    id: 'system.admin.instance.form.name',
    defaultMessage: 'Name',
  },
  host: {
    id: 'system.admin.instance.form.host',
    defaultMessage: 'Host',
  },
});

const validationSchema = yup.object({
  name: yup.string().required(formTranslations.required),
  host: yup.string().required(formTranslations.required),
});

const InstanceForm: FC<Props> = (props) => {
  const { handleClose, initialValues, onSubmit, setIsDirty, intl } = props;

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
    <div className="flex justify-end pt-5">
      <Button
        color="secondary"
        className="btn-cancel"
        disabled={disabled}
        key="instance-form-cancel-button"
        onClick={(): void => handleClose(isDirty)}
      >
        {intl.formatMessage(formTranslations.cancel)}
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
        {intl.formatMessage(formTranslations.submit)}
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
                label={intl.formatMessage(translations.name)}
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
              label={intl.formatMessage(translations.host)}
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
        {actionButtons}
      </form>
    </>
  );
};

export default injectIntl(InstanceForm);
