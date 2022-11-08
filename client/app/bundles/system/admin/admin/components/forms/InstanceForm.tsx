import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Controller, UseFormSetError } from 'react-hook-form';
import * as yup from 'yup';

import formTranslations from 'lib/translations/form';
import FormTextField from 'lib/components/form/fields/TextField';
import { InstanceFormData } from 'types/system/instances';
import FormDialog from 'lib/components/form/dialog/FormDialog';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: InstanceFormData,
    setError: UseFormSetError<InstanceFormData>,
  ) => void;
}

const translations = defineMessages({
  newInstance: {
    id: 'system.admin.instance.new.newInstance',
    defaultMessage: 'New Instance',
  },
  name: {
    id: 'system.admin.instance.form.name',
    defaultMessage: 'Name',
  },
  host: {
    id: 'system.admin.instance.form.host',
    defaultMessage: 'Host',
  },
});

const initialValues = {
  name: '',
  host: '',
};

const validationSchema = yup.object({
  name: yup.string().required(formTranslations.required),
  host: yup.string().required(formTranslations.required),
});

const InstanceForm: FC<Props> = (props) => {
  const { open, onClose, onSubmit } = props;
  const { t } = useTranslation();

  return (
    <FormDialog
      open={open}
      editing={false}
      onClose={onClose}
      onSubmit={onSubmit}
      title={t(translations.newInstance)}
      formName="instance-form"
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.name)}
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
            name="host"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                disabled={formState.isSubmitting}
                label={t(translations.host)}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                required
                variant="standard"
              />
            )}
          />
        </>
      )}
    </FormDialog>
  );
};

export default InstanceForm;
