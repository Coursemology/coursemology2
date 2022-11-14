import { FC } from 'react';
import { Controller, UseFormSetError } from 'react-hook-form';
import { defineMessages } from 'react-intl';
import { InstanceFormData } from 'types/system/instances';
import * as yup from 'yup';

import FormDialog from 'lib/components/form/dialog/FormDialog';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

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
      editing={false}
      formName="instance-form"
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={t(translations.newInstance)}
      validationSchema={validationSchema}
    >
      {(control, formState): JSX.Element => (
        <>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.name)}
                required
                variant="standard"
              />
            )}
          />

          <Controller
            control={control}
            name="host"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={formState.isSubmitting}
                field={field}
                fieldState={fieldState}
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
                label={t(translations.host)}
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
