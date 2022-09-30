import { Typography } from '@mui/material';
import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';

import { MaterialsSettingsData } from 'types/course/admin/materials';
import useTranslation from 'lib/hooks/useTranslation';
import FormTextField from 'lib/components/form/fields/TextField';
import Section from 'lib/components/layouts/Section';
import Form, { FormEmitter } from 'lib/components/form/Form';
import translations from './translations';
import commonTranslations from '../../translations';

interface MaterialsSettingsFormProps extends Emits<FormEmitter> {
  data: MaterialsSettingsData;
  onSubmit: (data: MaterialsSettingsData) => void;
  disabled?: boolean;
}

const MaterialsSettingsForm = (
  props: MaterialsSettingsFormProps,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form
      initialValues={props.data}
      headsUp
      emitsVia={props.emitsVia}
      onSubmit={props.onSubmit}
    >
      {(control): JSX.Element => (
        <Section title={t(translations.materialsSettings)} sticksToNavbar>
          <Controller
            name="title"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                variant="filled"
                label={t(commonTranslations.title)}
                fullWidth
                disabled={props.disabled}
              />
            )}
          />

          <Typography
            variant="body2"
            color="text.secondary"
            className="!mt-2 !mb-4"
          >
            {t(commonTranslations.leaveEmptyToUseDefaultTitle)}
          </Typography>
        </Section>
      )}
    </Form>
  );
};

export default MaterialsSettingsForm;
