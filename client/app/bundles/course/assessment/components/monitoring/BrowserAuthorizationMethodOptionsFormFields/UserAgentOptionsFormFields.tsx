import { Controller } from 'react-hook-form';
import { Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

import { BrowserAuthorizationMethodOptionsProps } from './common';

const UserAgentOptionsFormFields = ({
  control,
  pulsegridUrl,
  disabled,
  className,
}: BrowserAuthorizationMethodOptionsProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <Controller
        control={control}
        name="monitoring.secret"
        render={({ field, fieldState }) => (
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

      <Typography color="text.secondary" variant="body2">
        {t(translations.secretHint, {
          pulsegrid: (chunk) => (
            <Link opensInNewTab to={pulsegridUrl}>
              {chunk}
            </Link>
          ),
        })}
      </Typography>
    </div>
  );
};

export default UserAgentOptionsFormFields;
