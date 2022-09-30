import { Typography } from '@mui/material';
import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';

import useTranslation from 'lib/hooks/useTranslation';
import { AnnouncementsSettingsData } from 'types/course/admin/announcements';
import FormTextField from 'lib/components/form/fields/TextField';
import Section from 'lib/components/layouts/Section';
import Form, { FormEmitter } from 'lib/components/form/Form';
import translations from './translations';
import commonTranslations from '../../translations';

interface AnnouncementsSettingsFormProps extends Emits<FormEmitter> {
  data: AnnouncementsSettingsData;
  onSubmit: (data: AnnouncementsSettingsData) => void;
  disabled?: boolean;
}

const AnnouncementsSettingsForm = (
  props: AnnouncementsSettingsFormProps,
): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Form
      initialValues={props.data}
      headsUp
      emitsVia={props.emitsVia}
      onSubmit={props.onSubmit}
      disabled={props.disabled}
    >
      {(control): JSX.Element => (
        <Section title={t(translations.announcementsSettings)} sticksToNavbar>
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

export default AnnouncementsSettingsForm;
