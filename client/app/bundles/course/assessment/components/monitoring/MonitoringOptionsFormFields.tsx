import { Control, Controller } from 'react-hook-form';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import MonitoringIntervalsFormFields from './MonitoringIntervalsFormFields';
import translations from './translations';

const MonitoringOptionsFormFields = ({
  control,
  pulsegridUrl,
  disabled,
}: {
  control: Control;
  pulsegridUrl?: string;
  disabled?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <>
      <Controller
        control={control}
        name="monitoring.secret"
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth
            label={t(translations.secret)}
            variant="filled"
          />
        )}
      />

      <Typography className="!mt-0" color="text.secondary" variant="body2">
        {t(translations.secretHint, {
          pulsegrid: (chunk) => (
            <Link opensInNewTab to={pulsegridUrl}>
              {chunk}
            </Link>
          ),
        })}
      </Typography>

      <MonitoringIntervalsFormFields control={control} disabled={disabled} />
    </>
  );
};

export default MonitoringOptionsFormFields;
