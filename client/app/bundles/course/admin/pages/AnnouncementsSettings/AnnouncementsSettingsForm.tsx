import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';
import { Typography } from '@mui/material';
import { AnnouncementsSettingsData } from 'types/course/admin/announcements';

import Section from 'lib/components/core/layouts/Section';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import commonTranslations from '../../translations';

import translations from './translations';

interface AnnouncementsSettingsFormProps
  extends Emits<FormEmitter<AnnouncementsSettingsData>> {
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
      disabled={props.disabled}
      emitsVia={props.emitsVia}
      headsUp
      initialValues={props.data}
      onSubmit={props.onSubmit}
    >
      {(control): JSX.Element => (
        <Section sticksToNavbar title={t(translations.announcementsSettings)}>
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
};

export default AnnouncementsSettingsForm;
