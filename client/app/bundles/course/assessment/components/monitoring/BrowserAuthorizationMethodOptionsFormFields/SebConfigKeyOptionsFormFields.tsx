import { Controller } from 'react-hook-form';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

import { BrowserAuthorizationMethodOptionsProps } from './common';

const SebConfigKeyOptionsFormFields = ({
  control,
  disabled,
  className,
}: BrowserAuthorizationMethodOptionsProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <Controller
        control={control}
        name="monitoring.seb_config_key"
        render={({ field, fieldState }) => (
          <FormTextField
            disabled={disabled}
            field={field}
            fieldState={fieldState}
            fullWidth
            label={t(translations.sebConfigKeyFieldLabel)}
            variant="filled"
          />
        )}
      />

      <Typography color="text.secondary" variant="body2">
        {t(translations.sebConfigKeyFieldHint, {
          sebConfigKey: (chunk) => (
            <Link
              external
              opensInNewTab
              to="https://safeexambrowser.org/developer/seb-config-key.html"
            >
              {chunk}
            </Link>
          ),
          i: (chunk) => <i>{chunk}</i>,
        })}
      </Typography>
    </div>
  );
};

export default SebConfigKeyOptionsFormFields;
