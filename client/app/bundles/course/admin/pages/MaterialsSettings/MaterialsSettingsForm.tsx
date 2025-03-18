import { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import { Typography } from '@mui/material';
import { MaterialsSettingsData } from 'types/course/admin/materials';

import Section from 'lib/components/core/layouts/Section';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import commonTranslations from '../../translations';

import translations from './translations';

interface MaterialsSettingsFormProps {
  data: MaterialsSettingsData;
  onSubmit: (data: MaterialsSettingsData) => void;
  disabled?: boolean;
}

const MaterialsSettingsForm = forwardRef<
  FormRef<MaterialsSettingsData>,
  MaterialsSettingsFormProps
>((props, ref): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form
      ref={ref}
      disabled={props.disabled}
      headsUp
      initialValues={props.data}
      onSubmit={props.onSubmit}
    >
      {(control): JSX.Element => (
        <Section sticksToNavbar title={t(translations.materialsSettings)}>
          <Controller
            control={control}
            name="title"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={props.disabled}
                field={field}
                fieldState={fieldState}
                fullWidth
                label={t(commonTranslations.title)}
                variant="filled"
              />
            )}
          />

          <Typography
            className="!mb-4 !mt-2"
            color="text.secondary"
            variant="body2"
          >
            {t(commonTranslations.leaveEmptyToUseDefaultTitle)}
          </Typography>
        </Section>
      )}
    </Form>
  );
});

MaterialsSettingsForm.displayName = 'MaterialsSettingsForm';

export default MaterialsSettingsForm;
