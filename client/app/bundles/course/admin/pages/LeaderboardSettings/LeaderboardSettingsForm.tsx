import { Typography } from '@mui/material';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import Section from 'lib/components/layouts/Section';
import useTranslation from 'lib/hooks/useTranslation';
import { Emits } from 'react-emitter-factory';
import { Controller } from 'react-hook-form';

import { LeaderboardSettingsData } from 'types/course/admin/leaderboard';
import Form, { FormEmitter } from 'lib/components/form/Form';
import translations from './translations';
import commonTranslations from '../../translations';

interface LeaderboardSettingsFormProps extends Emits<FormEmitter> {
  data: LeaderboardSettingsData;
  onSubmit: (data: LeaderboardSettingsData) => void;
}

const LeaderboardSettingsForm = (
  props: LeaderboardSettingsFormProps,
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
        <Section title={t(translations.leaderboardSettings)} sticksToNavbar>
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

          <Controller
            name="displayUserCount"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                variant="filled"
                label={t(translations.displayUserCount)}
                type="number"
                fullWidth
              />
            )}
          />

          <Controller
            name="enableGroupLeaderboard"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                field={field}
                fieldState={fieldState}
                label={t(translations.enableGroupLeaderboard)}
              />
            )}
          />

          <Controller
            name="groupLeaderboardTitle"
            control={control}
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                field={field}
                fieldState={fieldState}
                variant="filled"
                label={t(translations.groupLeaderboardTitle)}
                fullWidth
              />
            )}
          />

          <Typography variant="body2" color="text.secondary" className="!mt-2">
            {t(commonTranslations.leaveEmptyToUseDefaultTitle)}
          </Typography>
        </Section>
      )}
    </Form>
  );
};

export default LeaderboardSettingsForm;
