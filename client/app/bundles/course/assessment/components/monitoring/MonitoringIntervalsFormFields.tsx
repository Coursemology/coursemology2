import { Control, Controller } from 'react-hook-form';
import { Grid, InputAdornment, Typography } from '@mui/material';

import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

const MonitoringIntervalsFormFields = ({
  control,
  disabled,
}: {
  control: Control;
  disabled?: boolean;
}): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Grid container direction="row" spacing={2}>
      <Grid item xs>
        <Grid container direction="row" spacing={2}>
          <Grid item xs>
            <Controller
              control={control}
              name="monitoring.min_interval_ms"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={disabled}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {t(translations.milliseconds)}
                      </InputAdornment>
                    ),
                  }}
                  label={t(translations.minInterval)}
                  required
                  type="number"
                  variant="filled"
                />
              )}
            />
          </Grid>

          <Grid item xs>
            <Controller
              control={control}
              name="monitoring.max_interval_ms"
              render={({ field, fieldState }): JSX.Element => (
                <FormTextField
                  disabled={disabled}
                  field={field}
                  fieldState={fieldState}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {t(translations.milliseconds)}
                      </InputAdornment>
                    ),
                  }}
                  label={t(translations.maxInterval)}
                  required
                  type="number"
                  variant="filled"
                />
              )}
            />
          </Grid>
        </Grid>

        <Typography className="!mt-0" color="text.secondary" variant="body2">
          {t(translations.intervalHint)}
        </Typography>
      </Grid>

      <Grid item xs>
        <Controller
          control={control}
          name="monitoring.offset_ms"
          render={({ field, fieldState }): JSX.Element => (
            <FormTextField
              disabled={disabled}
              field={field}
              fieldState={fieldState}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {t(translations.milliseconds)}
                  </InputAdornment>
                ),
              }}
              label={t(translations.offset)}
              required
              type="number"
              variant="filled"
            />
          )}
        />

        <Typography className="!mt-0" color="text.secondary" variant="body2">
          {t(translations.offsetHint)}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default MonitoringIntervalsFormFields;
