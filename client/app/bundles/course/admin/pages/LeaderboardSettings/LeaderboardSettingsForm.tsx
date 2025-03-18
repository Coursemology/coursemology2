import { forwardRef } from 'react';
import { Controller } from 'react-hook-form';
import { Typography } from '@mui/material';
import { LeaderboardSettingsData } from 'types/course/admin/leaderboard';

import Section from 'lib/components/core/layouts/Section';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import FormTextField from 'lib/components/form/fields/TextField';
import Form, { FormRef } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import commonTranslations from '../../translations';

import translations from './translations';

interface LeaderboardSettingsFormProps {
  data: LeaderboardSettingsData;
  onSubmit: (data: LeaderboardSettingsData) => void;
  disabled?: boolean;
}

const LeaderboardSettingsForm = forwardRef<
  FormRef<LeaderboardSettingsData>,
  LeaderboardSettingsFormProps
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
        <Section sticksToNavbar title={t(translations.leaderboardSettings)}>
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

          <Controller
            control={control}
            name="displayUserCount"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={props.disabled}
                field={field}
                fieldState={fieldState}
                fullWidth
                label={t(translations.displayUserCount)}
                type="number"
                variant="filled"
              />
            )}
          />

          <Controller
            control={control}
            name="enableGroupLeaderboard"
            render={({ field, fieldState }): JSX.Element => (
              <FormCheckboxField
                disabled={props.disabled}
                field={field}
                fieldState={fieldState}
                label={t(translations.enableGroupLeaderboard)}
              />
            )}
          />

          <Controller
            control={control}
            name="groupLeaderboardTitle"
            render={({ field, fieldState }): JSX.Element => (
              <FormTextField
                disabled={props.disabled}
                field={field}
                fieldState={fieldState}
                fullWidth
                label={t(translations.groupLeaderboardTitle)}
                variant="filled"
              />
            )}
          />

          <Typography className="!mt-2" color="text.secondary" variant="body2">
            {t(commonTranslations.leaveEmptyToUseDefaultTitle)}
          </Typography>
        </Section>
      )}
    </Form>
  );
});

LeaderboardSettingsForm.displayName = 'LeaderboardSettingsForm';

export default LeaderboardSettingsForm;
