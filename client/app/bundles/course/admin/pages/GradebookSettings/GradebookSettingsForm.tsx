import { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import { Typography } from '@mui/material';
import { GradebookSettingsData } from 'types/course/admin/gradebook';

import Section from 'lib/components/core/layouts/Section';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import Form, { FormRef } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface GradebookSettingsFormProps {
  data: GradebookSettingsData;
  onSubmit: (data: GradebookSettingsData) => void;
  disabled?: boolean;
}

const GradebookSettingsForm = forwardRef<
  FormRef<GradebookSettingsData>,
  GradebookSettingsFormProps
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
        <Section sticksToNavbar title={t(translations.gradebookSettings)}>
          <Controller
            control={control}
            name="weightedViewEnabled"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={props.disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.weightedViewEnabled)}
              />
            )}
          />

          <Typography className="!mt-2" color="text.secondary" variant="body2">
            {t(translations.weightedViewEnabledHint)}
          </Typography>
        </Section>
      )}
    </Form>
  );
});

GradebookSettingsForm.displayName = 'GradebookSettingsForm';

export default GradebookSettingsForm;
